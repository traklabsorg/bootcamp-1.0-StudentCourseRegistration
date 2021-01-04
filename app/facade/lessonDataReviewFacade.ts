import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataReviewDto } from "submodules/platform-3.0-Dtos/lessonDataReviewDto";
import { TenantDto } from "submodules/platform-3.0-Dtos/tenantDto";
import { LessonDataReview } from "submodules/platform-3.0-Entities/lessonDataReview";
import AppService from "submodules/platform-3.0-Framework/AppService/AppService";
// import { TenantDto } from "app/smartup_dtos/tenantDto";
// import { Tenant } from "app/smartup_entities/tenant";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewMapper')

@Injectable()
export class LessonDataReviewFacade extends AppService<LessonDataReview, LessonDataReviewDto> {
  // private map: Maps;
    constructor(@InjectRepository(LessonDataReview) private readonly lessonDataReviewRepository: Repository<LessonDataReview>,public http:HttpService) {
      super(http,lessonDataReviewRepository,LessonDataReview,LessonDataReview,LessonDataReviewDto,dto.lessonDataReviewentityJson, dto.lessonDataReviewdtoJson,dto.lessonDataReviewentityToDtoJson, dto.lessonDataReviewdtoToEntityJson);
    }
}