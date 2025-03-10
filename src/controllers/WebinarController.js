import axios from "axios";
import config from "../configs/config.js";
import { coerceRequestBody } from "../helpers/helper.js";
import WebinarService from "../services/WebinarService.js";
import catcher from "../utils/catcher.js";
import jwt from 'jsonwebtoken';
import { KJUR } from 'jsrsasign'

const WebinarController = {
    getMyWebinars: catcher(async (req, res) => {
        const { userId } = req.user;
        const { date } = req.query;

        const dateObj = new Date(date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const endOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
        const formattedDate2 = endOfMonth.toISOString().split('T')[0]; // End of the month

        console.log("WebinarController -> getMyWebinars -> formattedDate", formattedDate, formattedDate2)

        const webinars = await WebinarService.getMyWebinars(userId, formattedDate, formattedDate2);
        res.json({data: webinars});
    }),
    getWebinarById: catcher(async (req, res) => {
        const { id } = req.params;
        const webinar = await WebinarService.getWebinarById(id);
        res.json({data: webinar});
    }),
    getJwtToken: catcher(async (req, res) => {
        const apiKey = 'qVSozNyR8iEy70tKBhDeQ'; 
        const apiSecret = 'NZ7geJ0WejfCccb9Vd69QNccqOuDVMGo'; // Replace with your Zoom API Secret

        const payload = {
            iss: apiKey, // API Key as the issuer
            exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expiration (1 hour)
        };

        const token = jwt.sign(payload, apiSecret);

        res.json({data: token});
    }),
    getJwtTokenV2: catcher(async (req, res) => {
        const requestBody = coerceRequestBody(req.body);
        const apiKey = requestBody.apiKey;
        const { meetingNumber, role, expirationSeconds } = requestBody
        const iat = Math.floor(Date.now() / 1000)
        const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
        const oHeader = { alg: 'HS256', typ: 'JWT' }

        const oPayload = {
            appKey: config.zoomMeetingSdkKey,
            sdkKey: config.zoomMeetingSdkKey,
            mn: meetingNumber,
            role,
            iat,
            exp,
            tokenExp: exp
        }

        const sHeader = JSON.stringify(oHeader)
        const sPayload = JSON.stringify(oPayload)
        const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, config.zoomMeetingSdkSecret)
        const atResponse = await axios.post('https://zoom.us/oauth/token', {
            grant_type: 'account_credentials',
            account_id: 'MqNk2hSeRRCJI1L9uGr_Ow'
          }, {
            headers: {
              'Authorization': 'Basic ZlNpZ0d2RU5RQzZQVkg2M1FNQUtCdzo3MzQ4OHl3OTVzM0ZlOEJSV3RBdEFNOGZGSzQ4eEcxQg==',
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          console.log(atResponse.data.access_token)
      
        const access_token = atResponse.data.access_token;
      
        const zakResponse = await axios.get('https://zoom.us/v2/users/me/token?type=zak',
        {
          headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        console.log(zakResponse.data)
      
        const zakToken = zakResponse.data.token;
      
        return res.json({ signature: sdkJWT, zakToken })
    }),
    getUpcomingWebinar: catcher(async (req, res) => {
        const { userId } = req.user;
        const webinar = await WebinarService.getUpcomingWebinar(userId);
        res.json({data: webinar});
    })

}; 

export default WebinarController;