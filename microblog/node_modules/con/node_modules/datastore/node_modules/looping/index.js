
/**
 * Expose 'looping'
 */

module.exports = function(obj, fn, scope) {
  scope = scope || this;
  if( obj instanceof Array) array(obj, fn, scope);
  else object(obj, fn, scope);
};


exports.array = array;


/**
 * Object iteration.
 * 
 * @param  {Object}   obj   
 * @param  {Function} fn    
 * @param  {Object?}   scope 
 * @api private
 */

function object(obj, fn, scope) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      fn.call(scope, i, obj[i]);
    }
  }
}


/**
 * Array iteration.
 * 
 * @param  {Array}   obj   
 * @param  {Function} fn    
 * @param  {Object?}   scope 
 * @api private
 */

function array(obj, fn, scope) {
  for(var i = 0, l = obj.length; i < l; i++) {
    fn.call(scope, i, obj[i]);
  }
}