using System.Net;
using AutoMapper;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Common;

public abstract class BaseService
{
    protected readonly IUnitOfWork _unitOfWork;
    protected readonly IMapper _mapper;

    protected BaseService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    protected Result<T> Success<T>(T data, string message = "Success")
        => Result<T>.Success(data, message);
    protected Result<T> Created<T>(T data, string message = "Created")
        => Result<T>.Success(data, message);
    protected Result<T> NotFound<T>(string message)
        => Result<T>.Failure(HttpStatusCode.NotFound, message);

    protected Result<T> BadRequest<T>(string message)
        => Result<T>.Failure(HttpStatusCode.BadRequest, message);

    protected Result<T> Conflict<T>(string message)
        => Result<T>.Failure(HttpStatusCode.Conflict, message);

    protected Result<T> Unauthorized<T>(string message = "Unauthorized")
        => Result<T>.Failure(HttpStatusCode.Unauthorized, message);

    protected PageList<TDestination> MapPageList<TSource, TDestination>(PageList<TSource> source)
        => new(_mapper.Map<List<TDestination>>(source.Items), source.TotalCount, source.Page, source.PageSize);

}
