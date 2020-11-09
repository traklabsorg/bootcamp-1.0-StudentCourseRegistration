import { DeepPartial, EntitySchema, ObjectType } from "typeorm";
import { DtoBase } from "../../smartup_framework/framework/entities/dtoBase";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
// import { DtoBase } from "../../framework/entities/dtoBase";
// import { EntityBase } from "../../framework/entities/enitityBase";

var objectMapper = require('object-mapper');

export class EntityDtoMapper<TEntity extends EntityBase,TDto extends DtoBase> {

  private entityType: ObjectType<TEntity>;
  private dtoType : ObjectType<TDto>;
  private map = {};

  constructor(entitytype: ObjectType<TEntity>,dtotype: ObjectType<TDto>) {
    this.entityType = entitytype;
    this.dtoType = dtotype;
  }

  MapDtoToEntity(tDto:TDto): DeepPartial<TEntity> {

    //Read the properties whcih are of same name , do mapping using Object.Keys and Object,Values using recursion
    //INSTRUCTION: Use Inversify to resolve the mapper component for given TEntity and TDto and then call the mapper method of that.

    let map = {
      "ChannelName2": "ChannelName"
    };

    console.log("above dest");

    //TO RESOLVE
    let dest = objectMapper(this.dtoType, map);

    console.log('destination');
    console.log(dest);

    
        
    return dest;
  }

  // MapEntitytoDto(entity: TEntity[]): TDto {

  //   // let channelDto = new ChannelDto();
  //   //Read the properties whcih are of same name , do mapping using Object.Keys and Object,Values using recursion
        
  //   let map = {
  //     "ChannelName": "ChannelName2",
  //     "Content.ContentName": "Content"
  //   };
        
  //   var dest = objectMapper(entity, map);
  //   console.log(dest);
        
  //   return dest;
  // }
  
  AddMap(map: Object) {
    this.map = map;
    
  }

  MapEntityToDto(): ObjectType<TDto> {

    //Read the properties whcih are of same name , do mapping using Object.Keys and Object,Values using recursion

    let map = {
      "ChannelName2": "ChannelName"
    };

    console.log("above dest1");

    let dest = objectMapper(this.entityType,  {
      "ChannelName2": "ChannelName"
    });

    console.log(dest + " dest");
        
    return dest;
  }
}