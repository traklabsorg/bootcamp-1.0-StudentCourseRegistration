import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
// import { EnrolledMeetingDto } from "../../submodules/platform-3.0-Dtos/enrolledMeetingDto";
// import { EnrolledMeeting } from "../../submodules/platform-3.0-Entities/enrolledMeeting";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { EnrolledMeetingDto } from "submodules/platform-3.0-Dtos/enrolledMeetingsDto";
import { EnrolledMeetings } from "submodules/platform-3.0-Entities/enrolledMeetings";
let dto = require('../../submodules/platform-3.0-Mappings/enrolledMeetingsMapper')

@Injectable()
export class EnrolledMeetingFacade extends AppService<EnrolledMeetings, EnrolledMeetingDto> {
  // private map: Maps;
    constructor(@InjectRepository(EnrolledMeetings) private readonly enrolledMeetingRepository: Repository<EnrolledMeetings>,public http:HttpService) {
      super(http,enrolledMeetingRepository,EnrolledMeetings,EnrolledMeetings,EnrolledMeetingDto,dto.enrolledMeetingentityJson, dto.enrolledMeetingdtoJson,dto.enrolledMeetingentityToDtoJson, dto.enrolledMeetingdtoToEntityJson);
    }
  
}