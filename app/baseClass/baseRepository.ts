import { IWrite } from './write';
import { IRead } from './iRead';
import {createConnection} from "typeorm";
import { ResponseModel } from '../../smartup_framework/framework/entities/responseModel';


// that class only can be extended
export abstract class BaseRepository<T> implements IWrite<T>, IRead<T> {

    private entity:any;
    private dto:any;

    create(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(id: string, item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    find(item: T): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    findOne(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
    // async create(item: T): Promise<boolean> {
    //     const result: InsertOneWriteOpResult = await this._collection.insert(item);
    //     // after the insert operations, we returns only ok property (that haves a 1 or 0 results)
    //     // and we convert to boolean result (0 false, 1 true)
    //     return !!result.result.ok;
    //   }

    constructor(TEntity:T,TDto:T) {
        this.entity = TEntity;
//        this.dto = TDto;
      }


    get():ResponseModel<T> | null{
        console.log("Inside channel App");
        let channels = createConnection().then(async connection => {

        // let channel = new Channel();
        // channel.Id = 1234;
        // channel.ChannelName = "Channel one";

        // let id = 12345;
        // let channelName = "Channel one o one";
        // let channel = new Channel(id,channelName);
        //
        let channelRepository = connection.getRepository(this.entity);
        
});
return null;
    }
}