export class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  pagination() {
    let page = parseInt(this.queryString.page) || 1;
    if (page < 1) page = 1;
    
    let limit = parseInt(this.queryString.limit) || 5;
    if (limit < 1) limit = 10;
    
    const skip = (page - 1) * limit;
    
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  filter() {
    let excludeFields = ["page", "sort", "search", "select", "limit"];
    let filterObj = { ...this.queryString };
    excludeFields.forEach((field) => delete filterObj[field]);

    let filterStr = JSON.stringify(filterObj);
    filterStr = filterStr.replace(/\b(gt|gte|lt|lte|eq)\b/g, (match) => `$${match}`);
    const mongoFilter = JSON.parse(filterStr);

    this.query = this.query.find(mongoFilter); // [تغيير] نحدث this.query مباشرة
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.replaceAll(",", " "));
    }
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length) {
      const searchQuery = {
        $or: fields.map((field) => ({
          [field]: { $regex: this.queryString.search, $options: "i" }
        })),
      };
      this.query = this.query.find(searchQuery);
    }
    return this;
  }

  select() {
    if (this.queryString.select) {
      this.query = this.query.select(this.queryString.select.replaceAll(",", " "));
    }
    return this;
  }
}
