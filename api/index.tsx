import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import {addUserKey, getStats, userVoted, userValue} from "./vercel_endpoints/requests.js"
import { createSystem } from 'frog/ui' 
import { env } from 'node:process';
import { textComponent, 
  backgroundImage, outerComponentStyle, 
  pollResultStatsStyle, textStyle} from './utility.js'

//manually set vercel config variables
env.KV_REST_API_URL = "https://modest-sawfly-54128.upstash.io"
env.KV_REST_API_TOKEN = "AdNwAAIncDE4NDRhZTg3ZTBiMTE0NTVlOWY0ZTNhNjIzYjU1MWRmOHAxNTQxMjg"

//import built in components
const { Box, Image } = createSystem()

//initialize app and routes
export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  title: 'main',
})

//the root route
app.frame('/', async (c) => {
  return c.res({
    image: <Image
      objectFit="contain"
      src="/public/dune.png"
      width="100%"
    />,
    intents: [
      <Button value="enterpoll" action='/pollScreen'>Enter Poll</Button>,
    ],
  })
})

//route rendering after just voting
app.frame('/justvoted', async (c) => {
  const fid = c.frameData?.fid
  let usrVote : string = "Yes"
  let usrid : undefined | string = undefined
  if (fid){
    usrid = fid.toString()
    const usrvalue = await userValue(usrid)
    if (!usrvalue){
      usrVote = "No"
    }
  }
  return c.res({
    image: (
      <div
        style={outerComponentStyle}
      >
        {textComponent("You have successfully voted" + usrVote)}
        {backgroundImage()}
      </div>
    ),
    intents: [
      <Button value="result" action='/resultScreen'>View Results</Button>,
    ],
  })
})

//the voting screen
app.frame('/pollScreen', async (c) => {
  const { frameData, buttonValue} = c
  const fid = frameData
  let cur_usr_voted : boolean = false
  let usrid : undefined | string = undefined
  if (fid){
    usrid = fid.toString()
    cur_usr_voted = await userVoted(usrid)
  }
  if (buttonValue === "Yes"){
    if (usrid !== undefined){
      await addUserKey(usrid, true);
    }
  } else {
    if (usrid !== undefined){
      await addUserKey(usrid, false);
    }
  }
  let usrVote = "No";
  if (usrid !== undefined){
    const val = await userValue(usrid!)
    if (val){
      usrVote = "Yes";
    }
  }
  const txtToDisplay : string = cur_usr_voted ? 'You already voted: ' + '"' + usrVote +'"'
  : "There will be over a 10,000 Kramer predictions before 7/29 midnight ";
  return c.res({
    image: (
      <div
        style={outerComponentStyle}
      >
        {textComponent(txtToDisplay)}
        {backgroundImage()}
      </div>
    ),
    intents: cur_usr_voted ? 
    [<Button.Redirect location="https://warpcast.com/~/channel/kramer">Follow Kramer for updates</Button.Redirect>,
      <Button value="ViewPoll" action='/resultScreen'>View Positions</Button>
    ] : 
    [
      <Button value="Yes" action='/justvoted'>Yes</Button>,
      <Button value="No" action='/justvoted'>No</Button>,
    ],
  })
})

// result display screen
app.frame('/resultScreen', async (c) => {
  const [numYes, numNo] = await getStats();
  const totalVotes = numYes + numNo;
  const yesPercentage = (numYes / totalVotes) * 200 > 0 ? (numYes / totalVotes) * 200 : 500;
  const noPercentage = (numNo / totalVotes) * 200 > 0 ? (numNo / totalVotes) * 200 : 500;
  return c.res({
    image: (
      <div style={outerComponentStyle}>
        <Box 
          grow 
          flexDirection="column" 
          gap="8" 
          alignItems="center" 
          alignContent='center' 
          alignSelf='center' 
          textAlign='center'
        >
          <div style={textStyle}>
            There will be over a 10,000 Kramer predictions before 7/29 midnight
          </div>
          <Box grow flexDirection='row' alignItems='center' marginTop= '30' >
            <div style={{...pollResultStatsStyle, width: yesPercentage, background: 'darkgreen'}}>
              <Box grow flexDirection='row' alignItems='center' justifyContent='center'>
                {numYes}
              </Box>
            </div>
            <div style={{...pollResultStatsStyle, width: noPercentage, background: 'darkred'}}>
              <Box grow flexDirection='row' alignItems='center' justifyContent='center'>
                {numNo}
              </Box>
            </div>
          </Box>
          {backgroundImage()}
        </Box>
      </div>
    ),
    intents: [
      <Button.Redirect location="https://warpcast.com/~/channel/kramer">Follow Kramer for updates</Button.Redirect>,
    ],
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)