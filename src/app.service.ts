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
    auth: 'secret_8B6WXfgh87fKS9HEO0j2DFWx4c3X3kvYvuSXoMArFX3',
  });

  getHello(): string {
    return 'Hello world!';
  }

  async search(): Promise<any> {
    const results = await this.notion.search({});
    return results;
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
    return await this.notion.blocks.children.list({
      block_id: blockID,
    });
  }

  async handleBlockResults(blocks: any) {
    const blockWithChildren = blocks.results.filter((result: any) => {
      if (result.has_children) {
        return result;
      }
    });
    for (let i = 0; i < blockWithChildren.length; i++) {
      const childBlock = await this.getBlocks(blockWithChildren[i].id);
      blockWithChildren[i].childBlock = childBlock;
      await this.handleBlockResults(childBlock);
    }
  }
}
