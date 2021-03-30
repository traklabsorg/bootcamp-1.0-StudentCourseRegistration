import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessonDataDto } from "../../submodules/platform-3.0-Dtos/lessonDataDto";
import { LessonData } from "../../submodules/platform-3.0-Entities/lessonData";
import AppService from "../../submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppService";
// import { LessonDataDto } from "app/smartup_dtos/lessonDataDto";
// import { LessonData } from "app/smartup_entities/lessonData";
// import AppService from "smartup_framework/AppService/AppService";
import { Repository } from "typeorm";
import { UserRoleType } from "submodules/platform-3.0-Dtos/submodules/platform-3.0-Common/common/UserRoleType";
// let dto = require('../../submodules/platform-3.0-Mappings/lessonDataDto"')
let dto = require('../../submodules/platform-3.0-Mappings/lessonDataMapper')
@Injectable()
export class LessonDataFacade extends AppService<LessonData,LessonDataDto> {
    constructor(@InjectRepository(LessonData) private readonly lessonDataRepository: Repository<LessonData>,public http:HttpService) {
        super(http,lessonDataRepository, LessonData,LessonData,LessonDataDto, dto.lessonDataentityJson, dto.lessonDatadtoJson, dto.lessonDataentityToDtoJson, dto.lessonDatadtoToEntityJson);
        // super(lessonDataRepository, LessonData, {}, {}, {}, {});
    }

    async getGroupAndUserDetailsByUserId(userId:number){
        let data = await this.genericRepository.query(`SELECT 
                                                    users2.id as group_admin_user_id,
                                                    group_users1.group_id as user_groupId,
                                                    users2.user_details ->> 'firstName' group_admin_first_name,
                                                    users2.user_details ->> 'lastName' group_admin_last_name,
                                                    
                                                    users1.user_details ->> 'firstName' learner_first_name,
                                                    users1.user_details ->> 'lastName' learner_last_name
                                                FROM
                                                    public.users users1
                                                    JOIN public."groupUsers" group_users1 ON (group_users1.user_id = users1.id)
                                                    JOIN public."groupUsers" group_users2 ON (${UserRoleType.GroupAdmin} = Any(group_users2.role_ids) and group_users2.group_id = group_users1.group_id ) 
                                                    JOIN public.users users2 ON (users2.id = group_users2.user_id)
                                                WHERE users1.id = ${userId}`
                                                )
       return data;
    }
}