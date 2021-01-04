import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LiveContentUserDto } from "submodules/platform-3.0-Dtos/liveContentUserDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { LiveContentUser } from "submodules/platform-3.0-Entities/liveContentUser";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/liveContentUserMapper')

@Injectable()
export class LiveContentUserFacade extends AppService<LiveContentUser, LiveContentUserDto> {
  // private map: Maps;
    constructor(@InjectRepository(LiveContentUser) private readonly liveContentUserRepository: Repository<LiveContentUser>,public http:HttpService) {
      super(http,liveContentUserRepository,LiveContentUser,LiveContentUser,LiveContentUserDto,dto.liveContentUserentityJson, dto.liveContentUserdtoJson,dto.liveContentUserentityToDtoJson, dto.liveContentUserdtoToEntityJson);
    }
}