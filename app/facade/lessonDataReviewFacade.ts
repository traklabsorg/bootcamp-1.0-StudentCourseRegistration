import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataReviewDto } from "../../submodules/platform-3.0-Dtos/lessonDataReviewDto";
import { LessonDataReview } from "../../submodules/platform-3.0-Entities/lessonDataReview";
import AppService from "../../submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDataReviewDto } from "app/smartup_dtos/lessonDataReviewDto";
// import { LessonDataReview } from "app/smartup_entities/lessonDataReview";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataReviewMapper')
@Injectable()
export class LessonDataReviewFacade extends AppService<LessonDataReview,LessonDataReviewDto> {
    constructor(@InjectRepository(LessonDataReview) private readonly lessonDataReviewRepository: Repository<LessonDataReview>,public http:HttpService) {
        super(http,lessonDataReviewRepository, LessonDataReview,LessonDataReview,LessonDataReviewDto, dto.lessonDataReviewentityJson, dto.lessonDataReviewdtoJson, dto.lessonDataReviewentityToDtoJson, dto.lessonDataReviewdtoToEntityJson);
        // super(lessonDataReviewRepository, LessonDataReview, {}, {}, {}, {});
    }
}