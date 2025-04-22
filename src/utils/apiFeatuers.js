export class ApiFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    
      pagination() {
  let page = this.queryString.page * 1 || 1;
  if (page < 1) page = 1;
  let limit = this.queryString.limit * 1 || 5; // Ensure limit is a number
  let skip = (page - 1) * limit;
  this.query = this.query.skip(skip).limit(limit); // Update the query chain correctly
  this.page = page;
  return this;
}
    
  
    filter() {
      let excludeQuery = ["page", "sort", "search", "select"];
      let filterQuery = { ...this.queryString };
      excludeQuery.forEach((e) => delete filterQuery[e]);
      filterQuery = JSON.parse(
        JSON.stringify(filterQuery).replace(
          /(gt|lt|gte|lte|eq)/g,
          (match) => `$${match}`
        )
      );
      this.query.find(filterQuery);
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        this.query.sort(this.queryString.sort.replaceAll(",", " "));
      }
      return this;
    }
  
    select() {
      if (this.queryString.select) {
        this.query.select(this.queryString.select.replaceAll(",", " "));
      }
      return this;
    }
  
    search() {
      if (this.queryString.search) {
        this.query.find({
          $or: [
            { name: { $regex: this.queryString.search, $options: "i" } },
            { description: { $regex: this.queryString.search, $options: "i" } },
          ],
        });
      }
      return this;
    }
  }
