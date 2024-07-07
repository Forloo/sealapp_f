import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import {addUserKey, getStats, userVoted, userValue} from "./vercel_endpoints/requests.js"
import { createSystem } from 'frog/ui'
import { env } from 'node:process';

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
  const { frameData} = c

  const fid = frameData

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
        style={{
          alignItems: 'center',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: 60,
            display: 'flex',
            fontStyle: 'bold',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',

            position: 'relative', 
          }}
        >
          You have successfully voted "{usrVote}"
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            height: '100%',

            opacity: 0.3, 
          }}
        >
          <Image
            objectFit="contain"
            src="/public/dune.png"
            width="100%"
          />
        </div>

      </div>
    ),
    intents: [
      <Button value="result" action='/resultScreen'>View Results</Button>,
    ],
  })
})

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

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'black',
            fontSize: 60,
            display: 'flex',
            fontStyle: 'bold',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',

            position: 'relative', 
          }}
        >
          {cur_usr_voted
            ? 'You already voted: ' + '"' + usrVote +'"'
            : "There will be over a 10,000 Kramer predictions before 7/29 midnight "}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            height: '100%',

            opacity: 0.3,
          }}
        >
          <Image
            objectFit="contain"
            src="/public/dune.png"
            width="100%"
          />
        </div>
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

app.frame('/resultScreen', async (c) => {
  const { frameData } = c;
  const fid = frameData;


  const [numYes, numNo] = await getStats();


  const totalVotes = numYes + numNo;
  const yesPercentage = (numYes / totalVotes) * 200 > 0 ? (numYes / totalVotes) * 200 : 500;
  const noPercentage = (numNo / totalVotes) * 200 > 0 ? (numNo / totalVotes) * 200 : 500;

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Box grow flexDirection="column" gap="8" alignItems="center" alignContent='center' alignSelf='center' textAlign='center'>
          <div
            style={{
              color: 'black',
              display: 'flex',
              fontSize: 60,
              fontStyle: 'bold',
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              marginTop: 30,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
            }}
          >
            There will be over a 10,000 Kramer predictions before 7/29 midnight
          </div>
          <Box grow flexDirection='row' alignItems='center' marginTop= '30' >
              <div
              style={{
                color: 'white',
                background: 'darkgreen',
                fontSize: 60,
                display: 'flex',
                fontStyle: 'normal',
                letterSpacing: '-0.025em',
                lineHeight: 1.4,
                marginTop: 30,

                width: yesPercentage,
                position: 'relative',
                justifyContent: 'center',
                opacity: 1,
                borderRadius: 15,
              }}
            >
              <Box grow flexDirection='row' alignItems='center' justifyContent='center'>
                {numYes}
              </Box>
              
            </div>
            <div
              style={{
                color: 'white',
                backgroundColor: 'darkred',
                fontSize: 60,
                display: 'flex',
                fontStyle: 'normal',
                letterSpacing: '-0.025em',
                lineHeight: 1.4,
                marginTop: 30,
                whiteSpace: 'pre-wrap',
                // width: "100%",
                width: noPercentage,
                position: 'relative', 
                borderRadius: 15,

              }}
            >
              <Box grow flexDirection='row' alignItems='center' justifyContent='center'>
                {numNo}
              </Box>
            </div>
          </Box>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display:'flex',
              height: '100%',
              width: '100%',

              opacity: 0.3, 
            }}
          >
            <Image
            objectFit="contain"
            src="/public/dune.png"
            width="100%"
          />
          </div>
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