import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import {
  BlockObjectResponse,
  GetBlockResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';

// type childBlock = {
//   childBlock: ListBlockChildrenResponse;
// };
// type BlockWithChildren = BlockObjectResponse & childBlock;

dotenv.config();
@Injectable()
export class AppService {
  notion = new Client({
    auth: process.env.NOTION_KEY,
  });

  getHello(): string {
    return 'Hello world!';
  }

  async search(): Promise<any> {
    const res = await this.notion.search({});
    const { results, type, object } = res;

    const subjects: any = [];

    if (
      object === 'list' &&
      type === 'page_or_database' &&
      results.length > 0
    ) {
      const pages = results.filter((result: any) => {
        return result.object === 'page' && result.properties.title;
      });

      pages?.map((page: any) => {
        const {
          parent: { page_id },
        } = page;
        if (!subjects.includes(page_id)) subjects.push(page_id);
      });
    }
    const idTitleMap = {};
    //get the pages for each of these subjects and extract their titles.
    for (const subject of subjects) {
      const page: any = await this.notion.pages.retrieve({ page_id: subject });
      const title = page.properties.Name.title[0].plain_text;
      idTitleMap[subject] = title;
    }

    return { res, idTitleMap };
  }

  async getNotionDoc(docID: string): Promise<any> {
    // const databaseId = '2d9d1fd0f40845a69ef0dd3beaefb359' || '';
    const blocks = await this.getBlocks(docID);
    try {
      //check if each block has children if it does retrieve it.
      await this.handleBlockResults(blocks);
      return blocks;
    } catch (err) {
      return new Error(err);
    }
  }

  async getBlocks(blockID: string) {
    const blocks = await this.notion.blocks.children.list({
      block_id: blockID,
    });
    return blocks;
  }

  async handleBlockResults(blocks: any) {
    const blockWithChildren = blocks.results.filter((result: any) => {
      if (result.has_children) {
        return result;
      }
    });
    for (const block of blockWithChildren) {
      const childBlock = await this.getBlocks(block.id);
      block.childBlock = childBlock;
      await this.handleBlockResults(childBlock);
    }
  }
}
