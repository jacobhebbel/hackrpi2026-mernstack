import express from 'express';
import type { Request, Response } from 'express';
import { getMongo } from './db.js';

import type { MongoClient } from 'mongodb';
import type { FoxPhoto } from './types.js';


/**
 * Server logic
 * 
 * We serve images that a user can paginate through
 * The user can "save" an image which adds it to their collection
 * A user can view "saved" images
 * A user can remove an image from "saved"
 */


// base url to the Fox Images API
const FOX_API_URL = 'https://randomfox.ca/';

export const app = express();

app.use(express.json());


/**
 * GET Images
 * 
 * Images are served via the fox api
 * Should support pagination 
 */
app.get('/images/:id', (req: Request, res: Response) => {
    
    try {
        // ids must be gte / lte 
        const MIN_ID: Number = 1;
        const MAX_ID: Number = 124;
        const baseUrl = FOX_API_URL;

        // validates the arguments
        const imageId: Number = Number(req.params?.id);
        if (!imageId || imageId < MIN_ID || imageId > MAX_ID)
            return res.status(401).json({ 'err': 'Invalid ID' });

        // build the FoxPhoto type
        // url schema is baseUrl + 'i=imageId'
        
        const photo: FoxPhoto = {
            "id": imageId,
            "url": baseUrl + `images/${imageId}.jpg`
        };
        res.status(200).json(photo);
    } catch (err) {
        return res.status(500).json({ 'err': 'Failed to fetch image' });
    }
});


/**
 * GET Saved
 * Pulls saved images from MongoDB
 */
app.get('/saved', async (req: Request, res: Response) => {
    
    try {
        // gets all images saved in mongo
        const client: MongoClient = await getMongo();
        const collection = client.db().collection<FoxPhoto>('saved');

        const savedPhotos: FoxPhoto[] = await collection.find({}).toArray();

        return res.status(200).json(savedPhotos);
    } catch (err) {
        return res.status(500).json({ 'err': 'Failed to fetch saved images' });
    }
});


/**
 * POST Saved
 * Constructs an Image record and saves it to Mongo
 */
app.post('/saved', async (req: Request, res: Response) => {
    
    try {
        const client: MongoClient = await getMongo();
        const collection = client.db().collection<FoxPhoto>('saved');

        // constructs an Image record and saves it to Mongo
        const photo: FoxPhoto = {
            "id": Number(req.body?.id),
            "url": `${FOX_API_URL}images/${req.body?.id}.jpg`
        };

        const result = await collection.insertOne({
            "url": photo.url,
            "id": photo.id
        });

        return res.status(201).json({ "savedPhoto": photo, "insertedId": result.insertedId });
    } catch (err) {
        return res.status(500).json({ 'err': 'Failed to save image' });
    }
});


/**
 * DELETE Saved
 * Removes an image from Mongo
 */
app.delete('/saved/:id', async (req: Request, res: Response) => {
    
    try {
        const client: MongoClient = await getMongo();
        const collection = client.db().collection<FoxPhoto>('saved');

        // removes the image from mongo
        const imageId: Number = Number(req.params?.id);
        const result = await collection.deleteOne({ "id": imageId });

        return res.status(200).json({ "deletedCount": result.deletedCount });
    } catch (err) {
        return res.status(500).json({ 'err': 'Failed to delete saved image' });
    }
});