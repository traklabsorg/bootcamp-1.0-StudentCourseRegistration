import { Container, injectable, inject } from "inversify";
// import { AppService} from "../../framework/appservice/appService";
import { ChannelFacade } from "../2.facade/channelFacade";
// import { ChannelDto } from "../3.1 dtos/channelDto";
import { Channel } from "../4.1entities/channel";
import {TYPES} from "./types";

export class Registrations{
    private _container:Container;

    constructor(){
        this._container = new Container();

        


     //  let t =  this._container.resolve(ChannelsApp);


    }

    appServiceRegistrations(){
        //this._container.bind<AppService<ChannelDto, Channel>>(ChannelsApp).to(ChannelsApp );
        //this._container.bind<AppService<ChannelDto, Channel>>( IAppService<ChannelDto, Channel> ).toSelf();

        /*
            const myContainer = new Container();
            myContainer.bind<Warrior>(TYPES.Warrior).to(Ninja);
            myContainer.bind<Weapon>(TYPES.Weapon).to(Katana);
            myContainer.bind<ThrowableWeapon>(TYPES.ThrowableWeapon).to(Shuriken);
        */

        // this._container.bind<IAppService<ChannelDto, Channel>>(TYPES.ChannelAppService).to(new AppService<ChannelDto, Channel>());
    }

    facadeRegistrations(){
        this._container.bind<ChannelFacade>(ChannelFacade).toSelf();
    }
}