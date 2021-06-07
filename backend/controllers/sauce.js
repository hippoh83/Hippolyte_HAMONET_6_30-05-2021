const Sauce = require('../models/Sauce');
const fs = require('fs');


exports.createSauce = (req,res, next) =>{
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(()=> res.status(201).json({message: 'objet enregistré'}))
    .catch(error => res.status(400).json({error}));
}

exports.modifySauce = (req,res,next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    } : { ...req.body}
    Sauce.updateOne({ _id: req.params.id }, 
    {...sauceObject, _id: req.params.id})
    .then(()=> res.status(200).json({message : 'objet modifié'}))
    .catch( error => res.status(404).json({error}));
}

exports.deleteSauce = (req,res,next)=> {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, ()=> {
            Sauce.deleteOne({_id: req.params.id})
            .then(()=> res.status(200).json({message : 'objet supprimé'}))
            .catch(error => res.status(404).json({error}));
        })
    })
    .catch( error => res.status(500).json({ error }))
    
}

exports.getOneSauce = (req,res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then( sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}))
}

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json(error));
}

exports.likedSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id  })
    .then( sauce => {
        switch( req.body.like ){
            case 0:
                //l'utilisateur n'aime pas la sauce : on l'enleve du tableau like ou dislike et on  met la valeur -1
                if(sauce.usersLiked.includes(req.body.userId)){
                    sauce.usersLiked.splice(req.body.userId);
                    sauce.likes--;
                };
                if(sauce.usersDisliked.includes(req.body.userId)){
                    sauce.usersDisliked.splice(req.body.userId);
                    sauce.dislikes--;
                };
            break;
            case 1:
                //l'utilisateur aime la sauce, si il n'a pas deja aimé, on ajoute au tableau
                if(!sauce.usersLiked.includes(req.body.userId)){
                    sauce.usersLiked.push(req.body.userId);
                    sauce.likes++;
                };
                if(sauce.usersDisliked.includes(req.body.userId)){
                    sauce.usersDisliked.splice(req.body.userId);
                    sauce.dislikes--;
                }
            break;
            case -1:
                //si il a deja dislike la sauce, on enleve du tableau et valeur -1
                if(!sauce.usersDisliked.includes(req.body.userId)){
                    sauce.usersDisliked.push(req.body.userId);
                    sauce.dislikes++;
                };
                if(sauce.usersLiked.includes(req.body.userId)){
                    sauce.usersLiked.splice(req.body.userId);
                    sauce.likes--;
                }
            break;
            default:
                console.log('error : mauvais like number');

        }
        Sauce.updateOne({ _id: req.params.id  }, {
            likes: sauce.likes,
            dislikes: sauce.dislikes,
            usersLiked: sauce.usersLiked,
            usersDisliked: sauce.usersDisliked
        })
        .then(() => res.status(200).json({ message: 'votre avis a bien été comptabilisé' }))
        .catch(error => res.status(400).json({ error }));

    })
    .catch(error => res.status(400).json({ error }));
    
}