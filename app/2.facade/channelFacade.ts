
//It will send data to App layer in same format as it receives, unless there is some transformation or amalgamation of data.
// it sends dto to application layer
//it received dto from application layer

// it integrates with any external system(if there) with the data values and makes the whole object and sends it back to the routes
//else it returns as is

// import {ResponseModel} from "../../framework/entities/responseModel";
// import {ChannelDto} from "../../app/3.1 dtos/channelDto";
import {ChannelAppService} from "../3.0 application/channelAppService";
import { Container, injectable } from "inversify";
// import { AppService } from "../../framework/appservice/appService";
import { Channel } from "../4.1entities/channel";
import { ResponseModel } from "../../smartup_framework/framework/entities/responseModel";
import { ChannelDto } from "../3.1-dtos/3.1 dtos/channelDto";

@injectable()
export class ChannelFacade {

    getTest(){
        var container =   new Container();

        // var y = container.resolve<IAppService<ChannelDto, Channel>>();
    }

    async getAllChannels():Promise<ResponseModel<ChannelDto[]> | ChannelDto[] | null>{
        console.log("In facade");
        let channelsApp = new ChannelAppService();
        let result = await channelsApp.getAll();
        return result;
    }

    // post(data:any):ResponseModel<ChannelDto> | null{
    //     console.log("In facade post ");
    //     let channelsApp = new ChannelsApp();
    //     let result = channelsApp.post(data);
    //     return result;
    // }

    // post(data:any):ResponseModel<SampleDto> | null{
    //     console.log("In sample facade post ");
    //     let channelsApp = new ChannelEntityApp();
    //     let result = channelsApp.post(data);
    //     return null;
    // }

}















