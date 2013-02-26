module.exports = obj2Str;
function obj2Str(obj){
switch(typeof(obj)){
   case 'object':
    var ret = [];
    if (obj instanceof Array){
     for (var i = 0, len = obj.length; i < len; i++){
      ret.push(obj2Str(obj[i]));
     }
     return '[' + ret.join(',') + ']';
    }
    else if (obj instanceof RegExp){
     return obj.toString();
    }
    else{
     for (var a in obj){
      ret.push('"'+a+'"' + ':' + obj2Str(obj[a]));
     }
     return '{' + ret.join(',') + '}';
    }
   case 'function':
    return obj.toString();
   case 'number':
    return obj.toString();
   case 'string':
    return "\"" + obj.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function(a) {return ("\n"==a)?"\\n":("\r"==a)?"\\r":("\t"==a)?"\\t":"";}) + "\"";
   case 'boolean':
    return obj.toString();
   default:
    return obj.toString();
}
}