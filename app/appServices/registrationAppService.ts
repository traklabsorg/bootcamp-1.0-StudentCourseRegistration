import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RegistrationDto } from "submodules/platform-3.0-Dtos/registrationDto";
import { Registration } from "submodules/platform-3.0-Entities/registration";
import AppService from "submodules/platform-3.0-Entities/submodules/platform-3.0-Framework/AppService/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/platform-3.0-Mappings/registrationMapper')

@Injectable()
export default class RegistrationAppService extends AppService<Registration,RegistrationDto>{
    constructor(@InjectRepository(Registration) private readonly registrationRepository: Repository<Registration>,public http:HttpService) {
        super(http,registrationRepository,Registration,Registration,RegistrationDto,dto.registrationentityJson, dto.registrationdtoJson,dto.registrationentityToDtoJson, dto.registrationdtoToEntityJson);
        // super(RegistrationRepository, Registration, {}, {}, {}, {});
        
    }

    
} 