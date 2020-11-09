import { Console } from "console";
import { Connection } from "sequelize/types/lib/connection-manager";
import { ConnectionManager, createConnection, DeepPartial, EntitySchema, getConnectionManager, ObjectID, Repository } from "typeorm";
import { DtoBase } from "../entities/dtoBase";
import { EntityBase } from "../entities/enitityBase";
import { ResponseModel } from "../entities/responseModel";
import {EntityDtoMapper} from "../../../app/mappings/EntityDtoMapper"
// import { EntityDtoMapper } from "../../app/mappings/EntityDtoMapper";
var objectMapper = require('object-mapper');
import { plainToClass } from 'class-transformer';
import { ClassType } from "class-transformer/ClassTransformer";
import { RequestModel } from "../entities/requestmodel";
// import { injectable,inject } from "inversify";

// import { values } from "sequelize/types/lib/operators";

export type ObjectType<T> = { new(): T } | Function;

// @injectable()
class AppService< TEntity extends EntityBase, TDto extends DtoBase> {

  private entityType: ObjectType<TEntity>;
  private dtoType: ObjectType<TDto>;
  private entityMap = {};
  private dtoMap = {};

  private connectionManager: ConnectionManager;

  constructor(entitytype: ObjectType<TEntity>, dtotype: ObjectType<TDto>) {
    // @inject(TYPES.ChannelAppService) katana: IAppService,
    this.connectionManager = getConnectionManager();
    this.entityType = entitytype;
    this.dtoType = dtotype;
  }
  Get<TDto>(id: number): Promise<ResponseModel<TDto>> {
    throw new Error("Method not implemented.");
  };

  GetAll<TDto>(requestModel: any): Promise<ResponseModel<TDto>>  | null {
    throw new Error("Method not implemented.");
  };

  public addEntityMap(map: {}) {
    this.entityMap = map;
  }
  public addDtoMap(map: {}) {
    this.dtoMap = map;
  }
  protected async getRepository(type: ObjectType<TEntity> | EntitySchema<TEntity> | string): Promise<Repository<TEntity>> {
    const connection = await createConnection();
    console.log("connection abc");
    var result: TEntity[] | void = await connection.getRepository(type).find().catch((error) => console.log("error123   " + error));

    console.log(connection.getRepository(type).find().then((data) => {
      console.log("data     " + JSON.stringify(data));

    }).catch((error) => console.log("error   " + error)));
    if (result) { console.log("uuuuu" + JSON.stringify(result.map((item: TEntity) => ({ ...item, ChannelName2: item.ModifiedDate })))); }
    else {
      console.log("I dont know what the problem is....");
    }
    //Doubt : CLARIFIED
    let mapper = new EntityDtoMapper(this.entityType, this.dtoType)
    //let ans_dto = mapper.MapDtoToEntity();
    let ans_entity = mapper.MapEntityToDto();
    //console.log("All channels from the db: ", ans_dto);
    // console.log((await ans).find);
    return connection.getRepository(type);
  }

  public async findAll(type: ObjectType<TEntity> | EntitySchema<TEntity> | string,
    type1: ClassType<TDto>): Promise<ResponseModel<TDto[]> | TDto[] | null> {
    const connection = await createConnection();
    let map = {
      ChannelName: "ChannelName2?"
    };
    console.log("connection abc");
    let final_result: TDto[] = [];
    //    let objectMapper = new EntityDtoMapper<TEntity,TDto>(this.entityType,this.dtoType)
    var result: TEntity[] | void = await connection.getRepository(type).find().catch((error) => console.log("error123   " + error));
    if (result) {
      //      console.log(JSON.stringify(objectMapper({name:"Debabrata",lastName:"Mukherjee"},{"name":"fullname"})))
      result.forEach((item: TEntity) => {
        let result1 = plainToClass(type1, item);
        let result2 = plainToClass(type1, objectMapper(item, map));
        // console.log("hiiii...." + JSON.stringify(item) + JSON.stringify(map) + "\n\n");
        // console.log("result1 is....." + JSON.stringify(result1) + "\n\n");


        // console.log("abchiiii..." + JSON.stringify(objectMapper(item, map)) + "\n\n");
        // console.log("final result2 is....." + JSON.stringify(result2) + "\n\n\n\n");
        // console.log(JSON.stringify(result2) +"\n")
        final_result.push(result2)
      }
      )
    }
    // console.log("Final Result is......" + JSON.stringify(final_result));
    await connection.close();
    return final_result;
  }
  
  //type: ObjectType<TEntity> | EntitySchema<TEntity> | string,type1:ClassType<TDto> ): Promise<ResponseModel<TDto[]> | null
  public async post(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, type1: ClassType<TDto>, 
      requestModel: RequestModel<TDto>[]) {
    console.log("Inside Appservice Post.....");
    let map = {
      ChannelName2: "ChannelName?",
      ChannelType2: "ChannelType?",
      isExternalDto: "isExternal?",
      CreatedByDto: "CreatedBy?",
      ModifiedByDto:"ModifiedBy?"
    };
    
    // let entities = new Array<DeepPartial<TEntity>>();
    console.log(typeof requestModel);
    console.log(requestModel);

    //************* If entities.length > 0  **************//
    
    if (requestModel.length > 0) {
      createConnection().then(async connection => {
        let repository = connection.getRepository(type);
        requestModel.forEach(async function (value) {
          console.log(value);
          console.log("Object mapper result is........", objectMapper(value,map));
          let result2 = plainToClass(type1, objectMapper(value, map));
          console.log("result2 is....." + JSON.stringify(result2));
          let result = await repository.save(objectMapper(value, map));
          console.log('after post');
          console.log(result);
          await connection.close();
        })
        
      })
      .catch((error) => {
        console.log("error connecting to database   " + error);
      });
    }


  }

  public async put(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, type1: ClassType<TDto>, requestModel: RequestModel<TDto>) {

    const repository = await createConnection();
    let map = {
      ChannelName2: "ChannelName"
    };

    let mapper = new EntityDtoMapper(this.entityType, this.dtoType)
    let entities = new Array<DeepPartial<TEntity>>();
    let idArray:Array<number>;

    idArray = new Array<number>();

    if(requestModel.DataCollection!=null){;
      for (let i = 0; i < requestModel.DataCollection.length; i++) {
        let entity = mapper.MapDtoToEntity(requestModel.DataCollection[i]);
        entities.push(entity);
        // idArray.push(requestModel.DataCollection[i].Id);
      };
    }

   
    createConnection().then(async connection => {

      let repository = connection.getRepository(type);
      let iCount=0;

      for(let i=0;i<entities.length;i++){
        let id_temp = entities[i].Id==null?0:entities[i].Id;
        if(id_temp!=undefined && id_temp>0){
         // x = entities[i].Id;
          //let id_num:string = entities[i].Id.toString();
          var result = repository.update(idArray[iCount++], entities[i]);
        }
      };
    })
      .catch((error) => {
        console.log("error connecting to database   " + error);
      });
  }


  public async delete(type: ObjectType<TEntity> | EntitySchema<TEntity> | string,
     type1: ClassType<TDto>, requestModel: RequestModel<TDto>) {

    const repository = await createConnection();
    // let map = {
    //   ChannelName2: "ChannelName"
    // };
    //Doubt
    let mapper = new EntityDtoMapper(this.entityType, this.dtoType)
    let entities = new Array<DeepPartial<TEntity>>();
    let idArray:Array<number>;

    idArray = new Array<number>();

    if(requestModel.DataCollection!=null){
      for (let i = 0; i < requestModel.DataCollection.length; i++) {
        let entity = mapper.MapDtoToEntity(requestModel.DataCollection[i]);
        entities.push(entity);
        // idArray.push(requestModel.DataCollection[i].Id);
      };
    }

   
    createConnection().then(async connection => {

      let repository = connection.getRepository(type);
      let iCount=0;

      for(let i=0;i<entities.length;i++){
        let id_temp = entities[i].Id==null?0:entities[i].Id;
        if(id_temp!=undefined && id_temp>0){
         // x = entities[i].Id;
          //let id_num:string = entities[i].Id.toString();
          var result = repository.delete(idArray[iCount++]);
        }
      }}); 
    }
}


// interface IAppService<TDto,TEntity>{

//   Get<TDto>(id:number): Promise<ResponseModel<TDto>>;

//   GetAll<TDto>(requestModel:RequestModelQuery):Promise<ResponseModel<TDto>>|null;

// }

//Make RequestModelForQuery class

export {AppService}