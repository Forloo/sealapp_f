import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import { createSystem } from 'frog/ui' 
import { env } from 'node:process';
import { kv } from '@vercel/kv';

const backgroundOpacity = 0.1;

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



export function textComponent(txt : string) {
  return (
  <>
    <div style={textStyle}>
    {txt}
    </div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        height: '100%',
        opacity: backgroundOpacity, 
      }}>
      <Image
        objectFit="contain"
        src="/public/dune.png"
        width="100%"
      />
    </div>
  </>
  );
}

export function backgroundImage (){
  return (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'flex',
      height: '100%',
      opacity: backgroundOpacity,
    }}>
    <Image
    objectFit="contain"
    src="/public/dune.png"
    width="100%"
    />
  </div>
  );
}

export const outerComponentStyle = {
  alignItems: 'center',
  backgroundSize: '100% 100%',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  height: '100%',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%'
}

export const pollResultStatsStyle = {
  color: 'white',
  fontSize: 60,
  display: 'flex',
  fontStyle: 'normal',
  letterSpacing: '-0.025em',
  lineHeight: 1.4,
  marginTop: 30,
  position: 'relative',
  justifyContent: 'center',
  opacity: 1,
  borderRadius: 15,
}

export const textStyle = {
  color: 'black',
  display: 'flex',
  fontSize: 60,
  fontStyle: 'bold',
  letterSpacing: '-0.025em',
  lineHeight: 1.4,
  marginTop: 30,
  padding: '0 120px',
  whiteSpace: 'pre-wrap',
}


/**
 * @param userid id of the user
 * @returns true if user already voted, false otherwise
 */
export async function userVoted(userid : string){
  try {
      const exists = await kv.get(userid);
      if (exists !== undefined){
          return true;
      }
      return false;
  } catch (error){
      console.log(error);
  }
  return false;
}

/**
* 
* @param userid the unique id of the user
* @returns the value stored in user's key
*/
export async function userValue(userid : string){
  try {
      const exists = await kv.get(userid);
      if (exists !== undefined){
          return exists;
      }
  } catch (error){
      console.log(error);
  }
  return false;
}

/**
* Function to add a new user key value pair to the database.
* @param usrid id of the user
* @param yes true if user voted, false otherwise
*/
export async function addUserKey(usrid : string, yes : boolean) {
try {
  await kv.set(usrid, yes);
} catch (error) {
  // Handle errors
  console.log(error);
}
}

/**
* Function to return the stats of the poll.
* 
* @returns the number of yes's and number of no's of the poll
*/
export async function getStats(){
  let cursor = '0';
  let numYes = 0;
  let numNo = 0;
  try{
      do {
          const [nextCursor, keys] = await kv.scan(cursor);
          for (const key of keys) {
              const value = await kv.get(key);
              if (value){
                  numYes += 1;
              } else {
                  numNo += 1;
              }
          }
          cursor = nextCursor;
      } while (cursor !== '0');
      return [numYes, numNo];
  } catch (error) {
      console.log(error);
      return [0, 0]; 
  }
}