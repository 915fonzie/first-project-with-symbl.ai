import React, {useState} from 'react'
import {appIdAndSecret} from '../services/appIdAndSecret' //if forking project, will have to make your own file to use your appId and appSecret keys

const Home = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [validNumber, setValidNumber] = useState({isValid: true});
    const [areaCode, setAreaCode] = useState('+1');
    const [response, setResponse] = useState({});
    const [authToken] = useState({key: ''});
    const [conversationId, setConversationId] = useState('');
    const [message, setMessage] = useState('');
    const [startedCall, setStartedCall] = useState(true); //used to disable the get messages button if a call hasn't been made yet.

    const request = require('request');

    const authOptions = {
            method: 'POST',
            url: 'https://api.symbl.ai/oauth2/token:generate',
            body: {
                type: 'application',
                appId: appIdAndSecret.appId,
                appSecret: appIdAndSecret.appSecret
            },
            json: true
    };
    request(authOptions, (err, res, body) => { //this initial request is used to authorize the use of the api on first render; returns the accessToken
            if(err){
                console.error('error posting json: ', err);
                throw err;
            }
        setResponse(body);
    })

    //This method is to check for #'s only and the length in order to submit
    const validateAndUpdateLengthOfNumber = e => {
        setPhoneNumber(e.target.value.replace(/\D/,'')); //Checks to see if user is inputting anything other than a number
        if(phoneNumber.length === 9){ //Checks for a valid Number, length is 1 less because of how useState renders
            setValidNumber(false);
        }
        else{
            setValidNumber(true);
        }
    }

    //both handle methods are for updating the values of the area code and phone number as user changes input
    const handleAreaCode = e => {
        setAreaCode(e.target.value);
    }

    const handleSubmit = async e => {
        e.persist();
        e.preventDefault();
        const payload = {
            "operation": "start",
            "endpoint": {
                "type" : "pstn",
                "phoneNumber": `${areaCode + phoneNumber}`,
                "dtmf": "<code>"
            },
            "actions": [{
                "invokeOn": "stop",
                "name": "sendSummaryEmail",
                "parameters": {
                "emails": [
                    "alfonso.pru@outlook.com"
                ]
                }
            }],
            "data" : {
                "session": {
                    "name" : "Test"
                }
            } 
        }
        authToken.key = `${response.accessToken}`;
        const call = {
            method: "POST",
            url: 'https://api.symbl.ai/v1/endpoint:connect',
            headers: {'x-api-key': authToken.key},
            body: payload,
            json: true
        }

        await request(call, (err, response, body) => { //this post request is to create the payload to start the session which returns us the conversationId to get the messages
            if(err){
                console.error('error posting call: ', err);
                throw err;
            }
        setConversationId(body.conversationId);
        });
        setPhoneNumber("");
        setTimeout(() => setStartedCall(false), 10000); //created a timeout in order for there to be a delay between making the call and trying to get the messages
    }

    //this method is used to fetch the messages from the conversation that was used between the phone call
    const handleGetMessages = async () => {
        const options = {
            url: `https://cors-anywhere.herokuapp.com/https://api.symbl.ai/v1/conversations/${conversationId}/messages`,
            headers: {'x-api-key': authToken.key},
            json: true
        }

        await request.get(options, (err, res, body) => { //this request is used to collect all the messages associated from the previous call that match the conversationId
            if(err){
                console.error('error posting call: ', err);
                throw err;
            }
            let temp = []
            if(body.messages){
                for(let i = 0; i < body.messages.length; i++){
                    temp.push(<p key={i}>{body.messages[i].text}</p>)
                }
                setMessage(temp);
            }
            else{
                setMessage(<p>No messages thus far</p>);
            }
        });
        
    }


    return(
        <div>
            <h1>This app is to Test the Voice API from Symbl.ai</h1>
            <p>(It's currently a one way conversation, so for now when testing, say a couple of lines and then feel free to end the call afterwards)</p>
            <br/>
            <form onSubmit={handleSubmit}>
                <select value={areaCode} onChange={e => handleAreaCode(e)} placeholder="Please Choose an Area Code">
                    <option default>+1</option> {/* Just added some options but mainly using the USA area code for testing */}
                    <option>+220</option>
                    <option>+222</option>
                </select>
                <input type="text" value={phoneNumber} onChange={e => validateAndUpdateLengthOfNumber(e) } placeholder="Enter Phone #"/>
                <input type="submit" disabled={validNumber} value="Make Call"/>
            </form>
            <br/>
            <h4>After finishing the call, wait a couple of seconds and then press to get your messages</h4>
            <br/>
            <button onClick={handleGetMessages} disabled={startedCall}>Get Messages</button>
            <br/>
            <div>
                {message}
            </div>
        </div>
    )
}

export default Home;