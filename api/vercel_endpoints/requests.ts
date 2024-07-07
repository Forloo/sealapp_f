import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { useProfile } from "@farcaster/auth-kit";

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


/**
 * 
 * @returns true or false to indicate the user's authorization
 * and the user's unique id.
 */
export function getProfile() {
    const profile = useProfile();
    const {
      isAuthenticated,
      profile: { fid },
    } = profile;
    return [isAuthenticated, fid];
  }