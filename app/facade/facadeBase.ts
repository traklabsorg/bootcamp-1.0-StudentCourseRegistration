import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { DtoBase } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/DtoBase";
import AppService from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppServiceBase";
import { EntityBase } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/EntityBase/EntityBase";
import { RequestModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModel";
import { RequestModelQuery } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/RequestModelQuery";
import { ResponseModel } from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/submodules/platform-3.0-Common/common/ResponseModel";

@Injectable()
export default class FacadeBase<TEntity extends EntityBase, TDto extends DtoBase>{
    private appService: AppService<TEntity,TDto>;
    constructor(private service: AppService<TEntity,TDto>){
        this.appService = service;
        
    }

    async getByIds(ids: number[]):Promise<ResponseModel<TDto>>{
        try {
            console.log("Inside facade ......");
            return this.appService.getAll();
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async getAll(){
        try {
            console.log("Inside facade");
            return this.appService.getAll();
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async search(requestModel: RequestModelQuery){
        try {
            console.log("Inside facade ......group by pageSize & pageNumber");
            let result = await this.appService.search(requestModel);
            return result;
          } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async create(body: RequestModel<TDto>): Promise<ResponseModel<TDto>> {
        try {
            console.log("Inside CreateProduct of facade....body id" + JSON.stringify(body));
            let result = await this.appService.create(body);
            
            return result;
            
          } catch (error) {
            console.log("Error is....." + error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async update(body: RequestModel<TDto>): Promise<ResponseModel<TDto>>{
        try {
            console.log("Inside UpdateProduct of facade....body id" + JSON.stringify(body));
                   
            console.log("Executing update query..............")
            return await this.appService.updateEntity(body);
          } catch (error) {
            console.log("Error is....." + error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }

    }

    async deleteById(body: RequestModel<TDto>): Promise<ResponseModel<TDto>>{
        let delete_ids :Array<number> = [];
        body.DataCollection.forEach((entity:TDto)=>{
        delete_ids.push(entity.Id);
       
      })
      console.log("Ids are......",delete_ids);
      return this.appService.deleteById(delete_ids);
    }
}