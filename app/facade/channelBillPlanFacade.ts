import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelBillPlanDto } from "../../submodules/platform-3.0-Dtos/channelBillPlanDto";
import { ChannelBillPlan } from "../../submodules/platform-3.0-Entities/channelBillPlan";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/channelBillPlanMapper')

@Injectable()
export class ChannelBillPlanFacade extends AppService<ChannelBillPlan, ChannelBillPlanDto> {
  // private map: Maps;
    constructor(@InjectRepository(ChannelBillPlan) private readonly channelBillPlanRepository: Repository<ChannelBillPlan>,public http:HttpService) {
      super(http,channelBillPlanRepository,ChannelBillPlan,ChannelBillPlan,ChannelBillPlanDto,dto.channelBillPlanentityJson, dto.channelBillPlandtoJson,dto.channelBillPlanentityToDtoJson, dto.channelBillPlandtoToEntityJson);
    }
  
}