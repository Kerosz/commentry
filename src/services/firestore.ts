// packages
import firebase from "@/lib/firebase";
import { nanoid } from "nanoid";
// helpers
import { rawRouteTransform, transformRawSite } from "@/helpers/transformers";
// types
import type { RawSiteData, SiteData, AuthUserWithoutToken, RawRouteData } from "@/types";

/** Firebase firestore init */
const _DB = firebase.firestore();

export async function getUserByUsername(
  username: string
): Promise<AuthUserWithoutToken | undefined> {
  const { docs } = await _DB.collection("users").where("username", "==", username).limit(1).get();

  const [user] = docs.map((doc) => doc.data());

  return user as AuthUserWithoutToken;
}

export async function getUserByUserId(uid: string): Promise<AuthUserWithoutToken | undefined> {
  // We can run this query because the uid is exactly the same with the docId for the 'users' collection according to the initial firestore design
  const doc = await _DB.collection("users").doc(uid).get();

  if (!doc.exists) return undefined;

  const user = doc.data();

  return user as AuthUserWithoutToken;
}

export async function createUser(uid: string, data: AuthUserWithoutToken): Promise<void> {
  return _DB.collection("users").doc(uid).set(data);
}

export async function createNewSite(rawData: RawSiteData, userId: string): Promise<void> {
  const id = nanoid();
  const newSite = transformRawSite(rawData, id, userId);

  return _DB.collection("sites").doc(id).set(newSite);
}

export async function createNewRoute(rawData: RawRouteData, siteId: string): Promise<void> {
  const id = nanoid();
  const newRouteData = rawRouteTransform(rawData, id, siteId);

  return _DB.collection("routes").doc(id).set(newRouteData);
}

export async function updateSiteData(data: Partial<SiteData>, siteId: string): Promise<void> {
  data.updated_at = Date.now();

  return _DB.collection("sites").doc(siteId).update(data);
}

export async function getAllSitesByUserId(userId: string): Promise<SiteData[]> {
  const { docs } = await _DB.collection("sites").where("user_id", "==", userId).get();

  return docs.map((doc) => ({ doc_id: doc.id, ...doc.data() })) as SiteData[];
}

export async function getAllSites(): Promise<SiteData[]> {
  const { docs } = await _DB.collection("sites").get();

  return docs.map((doc) => ({ doc_id: doc.id, ...doc.data() })) as SiteData[];
}

export async function getSiteBySiteId(siteId: string): Promise<SiteData | undefined> {
  const doc = await _DB.collection("sites").doc(siteId).get();

  if (!doc.exists) return undefined;

  const site = doc.data();

  return site as SiteData;
}
