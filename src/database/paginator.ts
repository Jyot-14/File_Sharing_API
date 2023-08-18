interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalIteams: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const paginate = async (queryBuilder: any, req: any) => {
  let page = Number(req.query.page) || 1;
  let pageSize = Number(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  const records = await queryBuilder.skip(offset).take(pageSize).getMany();
  const totalIteams = await queryBuilder.getCount();

  const pages = Math.ceil(totalIteams / pageSize);
  const currentPage = offset / pageSize + 1;
  const hasNext = currentPage < pages;
  const hasPrevious = currentPage > 1;

  const PaginationInfo: PaginationInfo = {
    currentPage: page,
    pageSize: pageSize,
    totalIteams,
    pages,
    hasNext,
    hasPrevious,
  };
  return { records, PaginationInfo };
};
