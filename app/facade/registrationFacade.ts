import { Injectable } from "@nestjs/common";
import RegistrationAppService from "app/appServices/registrationAppService";
import { RegistrationDto } from "submodules/platform-3.0-Dtos/registrationDto";
import { Registration } from "submodules/platform-3.0-Entities/registration";
import FacadeBase from "./facadeBase";

@Injectable()
export class RegistrationFacade extends FacadeBase<Registration,RegistrationDto>{
    constructor(private registrationAppService: RegistrationAppService){
       super(registrationAppService);
    }
}