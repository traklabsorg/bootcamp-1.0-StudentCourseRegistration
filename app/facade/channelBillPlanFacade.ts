import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelBillPlanDto } from "submodules/platform-3.0-Dtos/channelBillPlanDto";
// import { ChannelBillPlanDto } from "submodules/platform-3.0-Dtos/ChannelBillPlanDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { ChannelBillPlan } from "submodules/platform-3.0-Entities/channelBillPlan";
// import { ChannelBillPlan } from "submodules/platform-3.0-Entities/community";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/ChannelBillPlanMapper')

@Injectable()
export class ChannelBillPlanFacade extends AppService<ChannelBillPlan, ChannelBillPlanDto> {
  // private map: Maps;
    constructor(@InjectRepository(ChannelBillPlan) private readonly ChannelBillPlanRepository: Repository<ChannelBillPlan>,public http:HttpService) {
      super(http,ChannelBillPlanRepository,ChannelBillPlan,ChannelBillPlan,ChannelBillPlanDto,dto.channelBillPlanentityJson, dto.channelBillPlandtoJson,dto.channelBillPlanentityToDtoJson, dto.channelBillPlandtoToEntityJson);
    }
}