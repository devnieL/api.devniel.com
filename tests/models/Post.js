var assert = require('assert');
var async = require('async');
var Post = require('./../../models/Post');

//TODO

describe('Post Tests', function(){
    
    describe('Basics', function(){

        it('should create a post and save it on the configured braph', function(done){

            var post = new Post({
                title : 'hello world',
                content : 'hello world',
                date :  new Date()
            });

            post.save(function(err){
                if(err) return done(err);
                done();
            });

        });

    });

});