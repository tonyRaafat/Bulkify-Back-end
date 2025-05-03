export class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  pagination() {
    let page = this.queryString.page * 1 || 1;
    if (page < 1) page = 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    this.query.find().skip(skip).limit(limit);
    this.page = page
    return this;
  }

  filter() {
    let excludeFields = ["page", "sort", "search", "select"];
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
