import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SectionReviewDto } from "../../submodules/platform-3.0-Dtos/sectionReviewDto";
import { SectionReview } from "../../submodules/platform-3.0-Entities/sectionReview";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { SectionReviewDto } from "app/smartup_dtos/sectionReviewDto";
// import { SectionReview } from "app/smartup_entities/sectionReview";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
// let dto = require('../../submodules/platform-3.0-Mappings/sectionReviewDto"')
let dto = require('../../submodules/platform-3.0-Mappings/sectionReviewMapper')
@Injectable()
export class SectionReviewFacade extends AppService<SectionReview,SectionReviewDto> {
    constructor(@InjectRepository(SectionReview) private readonly sectionReviewRepository: Repository<SectionReview>,public http:HttpService) {
        super(http,sectionReviewRepository, SectionReview,SectionReview,SectionReviewDto, dto.sectionReviewentityJson, dto.sectionReviewdtoJson, dto.sectionReviewentityToDtoJson, dto.sectionReviewdtoToEntityJson);
        // super(sectionReviewRepository, SectionReview, {}, {}, {}, {});
    }
}