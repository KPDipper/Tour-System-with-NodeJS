class API{
    constructor(query,queryString){
        this.query=query
        this.queryString=queryString
    }

    filter(){
        const queryObj={...this.queryString} 
        const excludeFileds=['pages','sort','limit','fields']
        excludeFileds.forEach(el=>delete queryObj[el])
       
          
        //advance filtering:http://localhost:5000/api/v1/tours?price[gte]=200
         let queryStr=JSON.stringify(queryObj)
         queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)

      
         this.query=this.query.find(JSON.parse(queryStr))
        return this
    }

    sort(){
         //2.SORTING:
         if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join(' ')//we have to pass multiple sort then always use space bwtn than comma.
            this.query=this.query.sort(sortBy)
            //sort('price,duration')http://localhost:5000/api/v1/tours?sort=price,durations
            //here first we sort on price then if two object has same prie then we sort against durations
            //for descening order all we need to do is ?sort=-price 
         }else{

            this.query = this.query.sort('-createdAt')

         }
         return this
    }

    limitfields(){
 
           //FILEDS:SELECTING
           if(this.queryString.fields){
            const field=this.queryString.fields.split(',').join(' ')
            this.query=this.query.select(field)

         }else{
            this.query=this.query.select('-secretTour -__v')
         }

         return this
    }
    pagination(){

        //Paginations:
        
         //page=2&limit=10, 1-10 page 1, 11-20 page 2 
         //execute query
         //if page was 3 then we have to skip(20)

         const page=parseInt(this.queryString.page) || 1
         const limit=parseInt(this.queryString.limit) || 100
         const skip=(page-1)*limit
         this.query=this.query.skip(skip).limit(limit)
         
         return this;

    }
}

module.exports=API