/*v0.49*/var CartoDB=CartoDB||{};if(typeof(google.maps.CartoDBLayer)==="undefined"){function CartoDBLayer(options){this.extend(CartoDBLayer,google.maps.OverlayView);this.options={query:"SELECT * FROM {{table_name}}",opacity:1,auto_bound:false,debug:false,visible:true,layer_order:"top",tiler_domain:"cartodb.com",tiler_port:"80",tiler_protocol:"http",sql_domain:"cartodb.com",sql_port:"80",sql_protocol:"http"};this.options=this._extend({},this.options,options);if(!this.options.table_name||!this.options.map){if(this.options.debug){throw ("cartodb-gmapsv3 needs at least a CartoDB table name and the gmapsv3 map object :(")}else{return}}this.initialize();this.setMap(options.map)}CartoDBLayer.prototype.extend=function(obj1,obj2){return(function(object){for(var property in object.prototype){this.prototype[property]=object.prototype[property]}return this}).apply(obj1,[obj2])};CartoDBLayer.prototype.initialize=function(){if(this.options.auto_bound){this.setBounds()}if(this.options.map_style){this._setMapStyle()}this._addWadus()};CartoDBLayer.prototype.draw=function(){};CartoDBLayer.prototype.onAdd=function(map){this._addInteraction()};CartoDBLayer.prototype.onRemove=function(map){this._remove()};CartoDBLayer.prototype.setOpacity=function(opacity){if(isNaN(opacity)||opacity>1||opacity<0){if(this.options.debug){throw (opacity+" is not a valid value")}else{return}}this.options.opacity=opacity;this._update()};CartoDBLayer.prototype.setQuery=function(sql){if(!isNaN(sql)){if(this.options.debug){throw (sql+" is not a valid query")}else{return}}this.options.query=sql;this._update()};CartoDBLayer.prototype.setStyle=function(style){if(!isNaN(style)){if(this.options.debug){throw (style+" is not a valid style")}else{return}}this.options.tile_style=style;this._update()};CartoDBLayer.prototype.setInteractivity=function(value){if(!isNaN(value)){if(this.options.debug){throw (value+" is not a valid setInteractivity value")}else{return}}this.options.interactivity=value;this._update()};CartoDBLayer.prototype.setLayerOrder=function(position){if(isNaN(position)&&position!="top"&&position!="bottom"){if(this.options.debug){throw (position+" is not a valid layer position")}else{return}}if(this.layer.gmaps_index){delete this.layer.gmaps_index}this.options.layer_order=position;this._setLayerOrder()};CartoDBLayer.prototype.setInteraction=function(bool){if(bool!==false&&bool!==true){if(this.options.debug){throw (bool+" is not a valid setInteraction value")}else{return}}if(this.interaction){if(bool){var self=this;this.interaction.on("on",function(o){self._bindWaxOnEvents(self.options.map,o)});this.interaction.on("on",function(o){self._bindWaxOffEvents()})}else{this.interaction.off("on");this.interaction.off("off")}}};CartoDBLayer.prototype.setOptions=function(options){if(typeof options!="object"||options.length){if(this.options.debug){throw (options+" options has to be an object")}else{return}}this.options=this._extend({},this.options,options);this._update()};CartoDBLayer.prototype.hide=function(){this.options.visible=false;this.options.before=this.options.opacity;this.setOpacity(0);this.setInteraction(false)};CartoDBLayer.prototype.show=function(){this.options.visible=true;this.setOpacity(this.options.before);delete this.options.before;this.setInteraction(true)};CartoDBLayer.prototype.isVisible=function(){return this.options.visible};CartoDBLayer.prototype._remove=function(){this.setInteraction(false);if(this.interaction){this.interaction.remove()}var self=this;this.options.map.overlayMapTypes.forEach(function(layer,i){if(layer==self.layer){self.options.map.overlayMapTypes.removeAt(i);return}})};CartoDBLayer.prototype._update=function(){this._remove();this._addInteraction()};CartoDBLayer.prototype.setBounds=function(sql){var self=this;if(!sql){var sql=this.options.query}reqwest({url:this._generateUrl("sql")+"/api/v2/sql/?q="+escape("SELECT ST_XMin(ST_Extent(the_geom)) as minx,ST_YMin(ST_Extent(the_geom)) as miny,ST_XMax(ST_Extent(the_geom)) as maxx,ST_YMax(ST_Extent(the_geom)) as maxy from ("+sql.replace(/\{\{table_name\}\}/g,this.options.table_name)+") as subq"),type:"jsonp",jsonpCallback:"callback",success:function(result){if(result.rows[0].maxx!=null){var coordinates=result.rows[0];var lon0=coordinates.maxx;var lat0=coordinates.maxy;var lon1=coordinates.minx;var lat1=coordinates.miny;var minlat=-85.0511;var maxlat=85.0511;var minlon=-179;var maxlon=179;var clampNum=function(x,min,max){return x<min?min:x>max?max:x};lon0=clampNum(lon0,minlon,maxlon);lon1=clampNum(lon1,minlon,maxlon);lat0=clampNum(lat0,minlat,maxlat);lat1=clampNum(lat1,minlat,maxlat);var ne=new google.maps.LatLng(lat0,lon0);var sw=new google.maps.LatLng(lat1,lon1);var bounds=new google.maps.LatLngBounds(sw,ne);self.options.map.fitBounds(bounds)}},error:function(e,msg){if(this.options.debug){throw ("Error getting table bounds: "+msg)}}})};CartoDBLayer.prototype._addWadus=function(){var self=this;setTimeout(function(){if(!document.getElementById("cartodb_logo")){var cartodb_link=document.createElement("a");cartodb_link.setAttribute("id","cartodb_logo");cartodb_link.setAttribute("style","position:absolute; bottom:3px; left:74px; display:block; border:none; z-index:100");cartodb_link.setAttribute("href","http://www.cartodb.com");cartodb_link.setAttribute("target","_blank");cartodb_link.innerHTML="<img src='http://cartodb.s3.amazonaws.com/static/new_logo.png' alt='CartoDB' title='CartoDB' style='border:none;' />";self.options.map.getDiv().appendChild(cartodb_link)}},2000)};CartoDBLayer.prototype._setMapStyle=function(){var self=this;reqwest({url:this._generateUrl("tiler")+"/tiles/"+this.options.table_name+"/map_metadata?callback=?",type:"jsonp",jsonpCallback:"callback",success:function(result){var map_style=json_parse(result.map_metadata);if(!map_style||map_style.google_maps_base_type=="roadmap"){self.map.setOptions({mapTypeId:google.maps.MapTypeId.ROADMAP})}else{if(map_style.google_maps_base_type=="satellite"){self.map.setOptions({mapTypeId:google.maps.MapTypeId.SATELLITE})}else{if(map_style.google_maps_base_type=="terrain"){self.map.setOptions({mapTypeId:google.maps.MapTypeId.TERRAIN})}else{var mapStyles=[{stylers:[{saturation:-65},{gamma:1.52}]},{featureType:"administrative",stylers:[{saturation:-95},{gamma:2.26}]},{featureType:"water",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"administrative.locality",stylers:[{visibility:"off"}]},{featureType:"road",stylers:[{visibility:"simplified"},{saturation:-99},{gamma:2.22}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.arterial",stylers:[{visibility:"off"}]},{featureType:"road.local",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi",stylers:[{saturation:-55}]}];map_style.google_maps_customization_style=mapStyles;self.map.setOptions({mapTypeId:google.maps.MapTypeId.ROADMAP})}}}if(!map_style){map_style={google_maps_customization_style:[]}}self.map.setOptions({styles:map_style.google_maps_customization_style})},error:function(e,msg){if(params.debug){throw ("Error getting map style: "+msg)}}})};CartoDBLayer.prototype._addInteraction=function(){var self=this;this.tilejson=this._generateTileJson();this.layer=new wax.g.connector(this.tilejson);this._setLayerOrder();if(this.options.interactivity){this.interaction=wax.g.interaction().map(this.options.map).tilejson(this.tilejson).on("on",function(o){self._bindWaxOnEvents(self.options.map,o)}).on("off",function(o){self._bindWaxOffEvents()})}};CartoDBLayer.prototype._bindWaxOnEvents=function(map,o){var point=this._findPos(map,o),latlng=this.getProjection().fromContainerPixelToLatLng(point);switch(o.e.type){case"mousemove":if(this.options.featureOver){return this.options.featureOver(o.e,latlng,o.pos,o.data)}else{if(this.options.debug){throw ("featureOver function not defined")}}break;case"click":if(this.options.featureClick){this.options.featureClick(o.e,latlng,o.pos,o.data)}else{if(this.options.debug){throw ("featureClick function not defined")}}break;case"touchend":if(this.options.featureClick){this.options.featureClick(o.e,latlng,o.pos,o.data)}else{if(this.options.debug){throw ("featureClick function not defined")}}break;default:break}};CartoDBLayer.prototype._bindWaxOffEvents=function(){if(this.options.featureOut){return this.options.featureOut&&this.options.featureOut()}else{if(this.options.debug){throw ("featureOut function not defined")}}};CartoDBLayer.prototype._generateTileJson=function(){var core_url=this._generateUrl("tiler"),base_url=core_url+"/tiles/"+this.options.table_name+"/{z}/{x}/{y}",tile_url=base_url+".png",grid_url=base_url+".grid.json";if(this.options.query){var query="sql="+encodeURIComponent(this.options.query.replace(/\{\{table_name\}\}/g,this.options.table_name));tile_url=this._addUrlData(tile_url,query);grid_url=this._addUrlData(grid_url,query)}if(this.options.tile_style){var style="style="+encodeURIComponent(this.options.tile_style.replace(/\{\{table_name\}\}/g,this.options.table_name));tile_url=this._addUrlData(tile_url,style);grid_url=this._addUrlData(grid_url,style)}if(this.options.interactivity){var interactivity="interactivity="+encodeURIComponent(this.options.interactivity.replace(/ /g,""));tile_url=this._addUrlData(tile_url,interactivity);grid_url=this._addUrlData(grid_url,interactivity)}return{blankImage:"../img/blank_tile.png",tilejson:"1.0.0",scheme:"xyz",name:this.options.table_name,tiles:[tile_url],grids:[grid_url],tiles_base:tile_url,grids_base:grid_url,opacity:this.options.opacity,formatter:function(options,data){return data}}};CartoDBLayer.prototype._setLayerOrder=function(){var self=this;this.options.map.overlayMapTypes.forEach(function(l,i){if(l==self.layer){self.options.map.overlayMapTypes.removeAt(i)}});if(this.layer.gmaps_index){this.options.map.overlayMapTypes.insertAt(this.layer.gmaps_index,this.layer);return}if(this.options.layer_order=="top"){this.options.map.overlayMapTypes.push(this.layer);return}if(this.options.layer_order=="bottom"){this.options.map.overlayMapTypes.insertAt(0,this.layer);return}var actual_length=this.options.map.overlayMapTypes.getLength();if(this.options.layer_order>=actual_length){this.options.map.overlayMapTypes.push(this.layer)}else{if(this.options.layer_order<=0){this.options.map.overlayMapTypes.insertAt(0,this.layer)}else{this.options.map.overlayMapTypes.insertAt(this.options.layer_order,this.layer)}}this.options.map.overlayMapTypes.forEach(function(l,i){l.gmaps_index=i})};CartoDBLayer.prototype._generateUrl=function(type){if(type=="sql"){return this.options.sql_protocol+"://"+((this.options.user_name)?this.options.user_name+".":"")+this.options.sql_domain+((this.options.sql_port!="")?(":"+this.options.sql_port):"")}else{return this.options.tiler_protocol+"://"+((this.options.user_name)?this.options.user_name+".":"")+this.options.tiler_domain+((this.options.tiler_port!="")?(":"+this.options.tiler_port):"")}};CartoDBLayer.prototype._parseUri=function(str){var o={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}},m=o.parser[o.strictMode?"strict":"loose"].exec(str),uri={},i=14;while(i--){uri[o.key[i]]=m[i]||""}uri[o.q.name]={};uri[o.key[12]].replace(o.q.parser,function($0,$1,$2){if($1){uri[o.q.name][$1]=$2}});return uri};CartoDBLayer.prototype._addUrlData=function(url,data){url+=(this._parseUri(url).query)?"&":"?";return url+=data};CartoDBLayer.prototype._extend=function(dest){var sources=Array.prototype.slice.call(arguments,1);for(var j=0,len=sources.length,src;j<len;j++){src=sources[j]||{};for(var i in src){if(src.hasOwnProperty(i)){dest[i]=src[i]}}}return dest};CartoDBLayer.prototype._findPos=function(map,o){var curleft=curtop=0;var obj=map.getDiv();if(obj.offsetParent){do{curleft+=obj.offsetLeft;curtop+=obj.offsetTop}while(obj=obj.offsetParent);return new google.maps.Point((o.e.clientX||o.e.changedTouches[0].clientX)-curleft,(o.e.clientY||o.e.changedTouches[0].clientY)-curtop)}else{return new google.maps.Point(o.e)}}}var json_parse=(function(){var at,ch,escapee={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},text,error=function(m){throw {name:"SyntaxError",message:m,at:at,text:text}},next=function(c){if(c&&c!==ch){error("Expected '"+c+"' instead of '"+ch+"'")}ch=text.charAt(at);at+=1;return ch},number=function(){var number,string="";if(ch==="-"){string="-";next("-")}while(ch>="0"&&ch<="9"){string+=ch;next()}if(ch==="."){string+=".";while(next()&&ch>="0"&&ch<="9"){string+=ch}}if(ch==="e"||ch==="E"){string+=ch;next();if(ch==="-"||ch==="+"){string+=ch;next()}while(ch>="0"&&ch<="9"){string+=ch;next()}}number=+string;if(!isFinite(number)){error("Bad number")}else{return number}},string=function(){var hex,i,string="",uffff;if(ch==='"'){while(next()){if(ch==='"'){next();return string}else{if(ch==="\\"){next();if(ch==="u"){uffff=0;for(i=0;i<4;i+=1){hex=parseInt(next(),16);if(!isFinite(hex)){break}uffff=uffff*16+hex}string+=String.fromCharCode(uffff)}else{if(typeof escapee[ch]==="string"){string+=escapee[ch]}else{break}}}else{string+=ch}}}}error("Bad string")},white=function(){while(ch&&ch<=" "){next()}},word=function(){switch(ch){case"t":next("t");next("r");next("u");next("e");return true;case"f":next("f");next("a");next("l");next("s");next("e");return false;case"n":next("n");next("u");next("l");next("l");return null}error("Unexpected '"+ch+"'")},value,array=function(){var array=[];if(ch==="["){next("[");white();if(ch==="]"){next("]");return array}while(ch){array.push(value());white();if(ch==="]"){next("]");return array}next(",");white()}}error("Bad array")},object=function(){var key,object={};if(ch==="{"){next("{");white();if(ch==="}"){next("}");return object}while(ch){key=string();white();next(":");if(Object.hasOwnProperty.call(object,key)){error('Duplicate key "'+key+'"')}object[key]=value();white();if(ch==="}"){next("}");return object}next(",");white()}}error("Bad object")};value=function(){white();switch(ch){case"{":return object();case"[":return array();case'"':return string();case"-":return number();default:return ch>="0"&&ch<="9"?number():word()}};return function(source,reviver){var result;text=source;at=0;ch=" ";result=value();white();if(ch){error("Syntax error")}return typeof reviver==="function"?(function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}({"":result},"")):result}}());
!function(a,b){typeof module!="undefined"?module.exports=b():typeof define=="function"&&define.amd?define(a,b):this[a]=b()}("reqwest",function(){function handleReadyState(a,b,c){return function(){a&&a[readyState]==4&&(twoHundo.test(a.status)?b(a):c(a))}}function setHeaders(a,b){var c=b.headers||{},d;c.Accept=c.Accept||defaultHeaders.accept[b.type]||defaultHeaders.accept["*"],!b.crossOrigin&&!c[requestedWith]&&(c[requestedWith]=defaultHeaders.requestedWith),c[contentType]||(c[contentType]=b.contentType||defaultHeaders.contentType);for(d in c){c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d])}}function generalCallback(a){lastValue=a}function urlappend(a,b){return a+(/\?/.test(a)?"&":"?")+b}function handleJsonp(a,b,c,d){var e=uniqid++,f=a.jsonpCallback||"callback",g=a.jsonpCallbackName||"reqwest_"+e,h=new RegExp("((^|\\?|&)"+f+")=([^&]+)"),i=d.match(h),j=doc.createElement("script"),k=0;i?i[3]==="?"?d=d.replace(h,"$1="+g):g=i[3]:d=urlappend(d,f+"="+g),win[g]=generalCallback,j.type="text/javascript",j.src=d,j.async=!0,typeof j.onreadystatechange!="undefined"&&(j.event="onclick",j.htmlFor=j.id="_reqwest_"+e),j.onload=j.onreadystatechange=function(){if(j[readyState]&&j[readyState]!=="complete"&&j[readyState]!=="loaded"||k){return !1}j.onload=j.onreadystatechange=null,j.onclick&&j.onclick(),a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(j),k=1},head.appendChild(j)}function getRequest(a,b,c){var d=(a.method||"GET").toUpperCase(),e=typeof a=="string"?a:a.url,f=a.processData!==!1&&a.data&&typeof a.data!="string"?reqwest.toQueryString(a.data):a.data||null,g;return(a.type=="jsonp"||d=="GET")&&f&&(e=urlappend(e,f),f=null),a.type=="jsonp"?handleJsonp(a,b,c,e):(g=xhr(),g.open(d,e,!0),setHeaders(g,a),g.onreadystatechange=handleReadyState(g,b,c),a.before&&a.before(g),g.send(f),g)}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function setType(a){var b=a.match(/\.(json|jsonp|html|xml)(\?|$)/);return b?b[1]:"js"}function init(o,fn){function complete(a){o.timeout&&clearTimeout(self.timeout),self.timeout=null,o.complete&&o.complete(a)}function success(resp){var r=resp.responseText;if(r){switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}}fn(resp),o.success&&o.success(resp),complete(resp)}function error(a,b,c){o.error&&o.error(a,b,c),complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout)),this.request=getRequest(o,success,error)}function reqwest(a,b){return new Reqwest(a,b)}function normalize(a){return a?a.replace(/\r?\n/g,"\r\n"):""}function serial(a,b){var c=a.name,d=a.tagName.toLowerCase(),e=function(a){a&&!a.disabled&&b(c,normalize(a.attributes.value&&a.attributes.value.specified?a.value:a.text))};if(a.disabled||!c){return}switch(d){case"input":if(!/reset|button|image|file/i.test(a.type)){var f=/checkbox/i.test(a.type),g=/radio/i.test(a.type),h=a.value;(!f&&!g||a.checked)&&b(c,normalize(f&&h===""?"on":h))}break;case"textarea":b(c,normalize(a.value));break;case"select":if(a.type.toLowerCase()==="select-one"){e(a.selectedIndex>=0?a.options[a.selectedIndex]:null)}else{for(var i=0;a.length&&i<a.length;i++){a.options[i].selected&&e(a.options[i])}}}}function eachFormElement(){var a=this,b,c,d,e=function(b,c){for(var e=0;e<c.length;e++){var f=b[byTag](c[e]);for(d=0;d<f.length;d++){serial(f[d],a)}}};for(c=0;c<arguments.length;c++){b=arguments[c],/input|select|textarea/i.test(b.tagName)&&serial(b,a),e(b,["input","select","textarea"])}}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var a={};return eachFormElement.apply(function(b,c){b in a?(a[b]&&!isArray(a[b])&&(a[b]=[a[b]]),a[b].push(c)):a[b]=c},arguments),a}var context=this,win=window,doc=document,old=context.reqwest,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",head=doc[byTag]("head")[0],uniqid=0,lastValue,xmlHttpRequest="XMLHttpRequest",isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},requestedWith:xmlHttpRequest},xhr=win[xmlHttpRequest]?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};return Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serializeArray=function(){var a=[];return eachFormElement.apply(function(b,c){a.push({name:b,value:c})},arguments),a},reqwest.serialize=function(){if(arguments.length===0){return""}var a,b,c=Array.prototype.slice.call(arguments,0);return a=c.pop(),a&&a.nodeType&&c.push(a)&&(a=null),a&&(a=a.type),a=="map"?b=serializeHash:a=="array"?b=reqwest.serializeArray:b=serializeQueryString,b.apply(null,c)},reqwest.toQueryString=function(a){var b="",c,d=encodeURIComponent,e=function(a,c){b+=d(a)+"="+d(c)+"&"};if(isArray(a)){for(c=0;a&&c<a.length;c++){e(a[c].name,a[c].value)}}else{for(var f in a){if(!Object.hasOwnProperty.call(a,f)){continue}var g=a[f];if(isArray(g)){for(c=0;c<g.length;c++){e(f,g[c])}}else{e(f,a[f])}}}return b.replace(/&$/,"").replace(/%20/g,"+")},reqwest.compat=function(a,b){return a&&(a.type&&(a.method=a.type)&&delete a.type,a.dataType&&(a.type=a.dataType),a.jsonpCallback&&(a.jsonpCallbackName=a.jsonpCallback)&&delete a.jsonpCallback,a.jsonp&&(a.jsonpCallback=a.jsonp)),new Reqwest(a,b)},reqwest});