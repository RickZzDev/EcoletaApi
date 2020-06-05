

const express  = require('express')
const knex  = require('./database/connection')
const routes = express.Router()
const multer = require('multer')
const multerConfig = require('./config/multer')

const upload = multer(multerConfig)

routes.get('/items',async (request,response)=>{
    const items = await knex('items').select('*')

    const serializedItems = items.map(item =>{
        return {
            id:item.id,
            title: 'item.name',
            image_url:`http://192.168.0.13:3333/uploads/${item.image}`
        }
    })

    return response.json(serializedItems)
})



routes.post('/points',upload.single('image') , async (request,response)=>{
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

     

     const point = {
        image: request.file.originalname,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
     }

    //  const trx = knex.Transaction()

     const insertedIds = await knex('points').insert(point)

     const point_id = insertedIds[0]

     const pointItems = items.split(',')
     .map(item=>item.trim())
     .map(item_id=>{
         return {
             item_id,
             point_id : insertedIds[0]
         }
     })

     await knex('point_items').insert(pointItems)
     
    //  await trx.commit()

     return response.json({
        id:point_id,
        ...point
     })
})

routes.get('/points', async(request,response)=>{
    const {uf} = request.query
    
    const {items} = request.query
    const {city} = request.query

    const parsedItems = String(items)
     .split(',')
     .map(item=>Number(item.trim()))
 
     var points = await knex('points')
     .join('point_items', 'points.id', '=' , 'point_items.point_id')
     .whereIn('point_items.item_id', parsedItems)
     .where('uf', String(uf))
     .where('city', String(city))
     .distinct()
     .select('points.*')

   
     const serializedPoints = {
        ...point,
        image_url:`http://192.168.0.13:3333/uploads/${point.image}`
    }
 
     return response.json(serializedPoints)
 })

 routes.get('/points/all',async (request,response)=>{




    const point = await knex('points').select('*')


    const Oporra = await knex('points')
    .join('point_items', 'point_items.point_id', '=','points.id')
    // .where('point_items.point_id', id)
    .distinct()
    .select('points.*')

    // const items = await knex('items')
    // .join('point_items', 'items.id', '=','point_items.item_id')
    // // .where('point_items.point_id', id)
    // .distinct()
    // .select('points')
    return response.json({Oporra})


}) 

routes.get('/points/:id', async(request,response)=>{
    const {id} = request.params

    const point = await knex('points').where('id',id).first()

    if(!point){
        return response.status(400).json({message:"nada encontrado"})
    }

    const items = await knex('items')
    .join('point_items', 'items.id', '=','point_items.item_id')
    .where('point_items.point_id', id)
    .select('items.title')

    const serializedPoints = {
        ...point,
        image_url:`http://192.168.0.13:3333/uploads/${point.image}`
    }

    return response.json({serializedPoints, items})
})



module.exports = routes
 