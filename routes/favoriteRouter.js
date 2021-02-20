const express = require('express');
const Favorite = require('../models/favorite');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({user: req.user._id})
            .populate('user')
            .populate('campsite')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applications/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
            .then(favorites => {
                if(favorites){
                    req.body.forEach(fav => {
                        if(!favorites.campsites.includes(fav._id)){
                            favorites.campsites.push(fav._id)
                        }
                         
                    })
                    favorites.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err))
                }else{
                    Favorite.create({user: req.user._id})
                    .then(favorites => {
                        req.body.forEach(fav => {
                        if(!favorites.campsites.includes(fav._id)){
                            favorites.campsites.push(fav._id)
                        }
                         
                    })
                    favorites.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'applications/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err))
                    })
                    
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites.');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneandDelete(req.user._id)
            .then(response => {
                if(!response){
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('You do not have any favorites to delete')
                }else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'applications/json');
                    res.json(response);
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({user: req.user._id})
            .then(favorites => {
                if(favorites){
                        if(!favorites.campsites.includes(favorites._id)){
                            favorites.campsites.push(favorites._id)
                            favorites.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'applications/json');
                                res.json(favorite);
                        })
                        .catch(err => next(err))
                        }  
                }else{
                    Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'applications/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err))
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete(req.user._id)
            .then(favorites => {
                if (!favorites){
                    res.setHeader('Content-Type', 'text/plain')
                    res.end('There are no favorites to delete')
                }else{
                    let index = favorites.campsites.indexOf(req.params.campsiteId)
                    if (index !== -1){
                        favorites.campsites.splice(index, 1);
                    }
                    favorites.save()
                    .then(response => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(response)
                    })
                    
                }
                
            })
            .catch(err => next(err));
    });

module.exports = favoriteRouter;