using System.Net;
using AutoMapper;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Models;

namespace CourtManagementBE.Application.Common;

public abstract class BaseService
{
    protected readonly IUnitOfWork _unitOfWork;
    protected readonly IMapper _mapper;
    protected readonly ICurrentUserContext? _currentUser;

    protected BaseService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    protected BaseService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserContext currentUser)
        : this(unitOfWork, mapper)
    {
        _currentUser = currentUser;
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

    protected bool CanAccessFacility(int facilityId)
        => _currentUser is null || _currentUser.CanAccessFacility(facilityId);

    protected int? WorkingFacilityId => _currentUser?.WorkingFacilityId;

    protected async Task<bool> CanAccessCourt(int courtId)
    {
        var workingFacilityId = WorkingFacilityId;
        if (_currentUser is null || (_currentUser.IsSuperAdmin && workingFacilityId is null))
        {
            return true;
        }

        var court = await _unitOfWork.ICourtRepository.FindFirst(x => x.CourtID == courtId);
        return court is not null && CanAccessFacility(court.FacilityID);
    }

    protected async Task<List<int>> GetScopedCourtIds()
    {
        var workingFacilityId = WorkingFacilityId;
        if (_currentUser is null || (_currentUser.IsSuperAdmin && workingFacilityId is null))
        {
            var allCourts = await _unitOfWork.ICourtRepository.FindList(_ => true);
            return allCourts.Select(x => x.CourtID).ToList();
        }

        if (workingFacilityId is null)
        {
            return [];
        }

        var courts = await _unitOfWork.ICourtRepository.FindList(x => x.FacilityID == workingFacilityId);
        return courts.Select(x => x.CourtID).ToList();
    }

}
