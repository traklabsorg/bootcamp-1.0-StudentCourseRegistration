const express = require("express");
const router = express.Router();
const authorization = require('../../authorization');
const authentication = require("../../authentication");
const configuration = require("../../configuration");
// import FacadeBase from "../../smartup_framework/framework/facade/facadeBase;
import FacadeBase from "../../smartup_framework/framework/facade/facadeBase"
import {ChannelFacade} from "../2.facade/channelFacade";
// import { ChannelDto } from "../3.1 dtos/channelDto";
import { ChannelDto } from "../3.1-dtos/3.1 dtos/channelDto";
import { Channel } from "../4.1entities/channel";

// configuration, authentication, authorization,

// {"path":"/channels","stack":[{"name":"configuration",
// "keys":[],"regexp":{"fast_star":false,"fast_slash":false},
// "method":"get"},{"name":"authenticateToken","keys":[],
// "regexp":{"fast_star":false,"fast_slash":false},"method":"get"},
// {"name":"<anonymous>","keys":[],"regexp":{"fast_star":false,"fast_slash":false},
// "method":"get"}],"methods":{"get":true}}


router.get("/channels",configuration, authentication,async function(req:any,res:any){
    // console.log("inside channels123");
    console.log("route name is \n" + JSON.stringify(req.route.path)+ "\n");
    console.log("route method " + req.route.stack[0].method);
    console.log("params  "+ JSON.stringify(req.params));
    
    let channelFacade = new ChannelFacade();
    let result = await channelFacade.getAllChannels();
    res.send(JSON.stringify(result));
});

router.get("/channels/:id", function(req:any,res:any){

    res.send("hello with id ");
});

router.post("/channels",function(req:any,res:any){
    console.log('inside channels');
    let channelFacade = new FacadeBase<Channel, ChannelDto>(Channel, ChannelDto);
    //Need to type cast to RequestModel
    console.log("route method " + req.route.stack[0].method);
    let result = channelFacade.post(Channel, ChannelDto, req.body);
    res.send("success");
});

router.put("/channels/:id", configuration, authentication, authorization, function(req:any,res:any){
    let channelFacade = new FacadeBase<Channel, ChannelDto>(Channel, ChannelDto);
    //Need to type cast to RequestModel

    res.send("success");
});

router.delete("/channels/:id", configuration, authentication, authorization, function(req:any,res:any){
    let channelFacade = new FacadeBase<Channel, ChannelDto>(Channel, ChannelDto);
    //Need to type cast to RequestModel

    //let result = channelFacade.put(Channel, ChannelDto, 3, req.body);
    res.send("success");
});

module.exports = router;