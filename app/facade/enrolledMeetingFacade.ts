import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EnrolledMeetingDto } from "../../submodules/platform-3.0-Dtos/enrolledMeetingDto";
import { EnrolledMeeting } from "../../submodules/platform-3.0-Entities/enrolledMeeting";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/enrolledMeetingMapper')

@Injectable()
export class EnrolledMeetingFacade extends AppService<EnrolledMeeting, EnrolledMeetingDto> {
  // private map: Maps;
    constructor(@InjectRepository(EnrolledMeeting) private readonly enrolledMeetingRepository: Repository<EnrolledMeeting>,public http:HttpService) {
      super(http,enrolledMeetingRepository,EnrolledMeeting,EnrolledMeeting,EnrolledMeetingDto,dto.enrolledMeetingentityJson, dto.enrolledMeetingdtoJson,dto.enrolledMeetingentityToDtoJson, dto.enrolledMeetingdtoToEntityJson);
    }
  
}