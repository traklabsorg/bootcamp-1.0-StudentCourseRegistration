import { ClassType } from "class-transformer/ClassTransformer";
import { EntitySchema } from "typeorm";
import {AppService} from "../appservice/appService";
import { DtoBase } from "../entities/dtoBase";
import { EntityBase } from "../entities/enitityBase";
import { RequestModel } from "../entities/requestmodel";

export type ObjectType<T> = { new(): T } | Function;

export default class FacadeBase<TEntity extends EntityBase, TDto extends DtoBase>{

    private entityType: ObjectType<TEntity>;
    private dtoType: ObjectType<TDto>;

    constructor(entitytype: ObjectType<TEntity>, dtotype: ObjectType<TDto>) {

        this.entityType = entitytype;
        this.dtoType = dtotype;
    }

    public async get(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, 
        type1: ClassType<TDto>, requestModel: RequestModel<TDto>) {

        let appService = new AppService<TEntity,TDto>( this.entityType,this.dtoType );
        let results = await appService.findAll(this.entityType, type1);
        
        console.log("Inside facade base put func");
    }


    public async post(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, 
            type1: ClassType<TDto>, requestModel: RequestModel<TDto>[]) {

    //console.log(requestModel);
        console.log("Inside facabase Post");
        //instantiate app service components and then call the apropriate method.
        let appService = new AppService<TEntity,TDto>( this.entityType,this.dtoType );
        let results = await appService.post(this.entityType, type1, requestModel);
        
       // console.log("Inside facade base");
        //let entities = new Array<DeepPartial<TEntity>>();
    }

    public async put(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, 
        type1: ClassType<TDto>, requestModel: RequestModel<TDto>) {

        let appService = new AppService<TEntity,TDto>( this.entityType,this.dtoType );
        let results = await appService.put(this.entityType, type1, requestModel);
        
        console.log("Inside facade base put func");
    }

    public async delete(type: ObjectType<TEntity> | EntitySchema<TEntity> | string, 
        type1: ClassType<TDto>, requestModel: RequestModel<TDto>) {

        let appService = new AppService<TEntity,TDto>( this.entityType,this.dtoType );
        let results = await appService.delete(this.entityType, type1, requestModel);
        
        console.log("Inside facade base delete func");
    }
}