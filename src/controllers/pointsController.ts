const knex = require('../database/connection')
import {Request,Response} from 'express'

class PointsController{
   async create(request : Request,response : Response){
    const {
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
        items
    }
     = request.body;
     
     const insertedIds = await knex('points').insert({
        image: 'image-fake',
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
     })

     const point_id = insertedIds[0]

     const pointItems = items.map((item_id:number)=>{
         return {
             item_id,
             point_id : insertedIds[0]
         }
     })

     await knex('point_items').insert(pointItems)
     return response.json({sucess:true})
    }
}

module.exports = PointsController