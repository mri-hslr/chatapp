import {WebSocketServer} from "ws"

const wss=new WebSocketServer({port:7070});
let arrobj=[{

}]

wss.on('connection',(socket)=>{
    
    socket.on('message',(message)=>{
        const parsedMessage=JSON.parse(message);
        if(parsedMessage.type==="join")
        {
            arrobj.push({
                socket,
                room:parsedMessage.payload.roomId
            })
        }
        if(parsedMessage.type==="chat")
        {
            let currentuseroom=null;
            for(let i=0;i<arrobj.length;i++)
            {
                if(arrobj[i].socket==socket)
                {
                    currentuseroom=arrobj[i].room;
                }
            }
            for(let i=0;i<arrobj.length;i++)
            {
                if(arrobj[i].room==currentuseroom)
                {
                    arrobj[i].socket.send(parsedMessage.payload.message)
                }
            }
        }
    })
    socket.on("close", () => {
        arrobj = arrobj.filter((entry) => entry.socket !== socket);
        console.log("Socket disconnected. Active connections:", arrobj.length);
    });
    
})