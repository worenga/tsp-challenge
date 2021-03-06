#include <iostream>

#include "tsp_distance_matrix.h"
#include <cassert>
namespace tsp_challenge {

void TSPDistanceMatrix::registerDistance(const int idxPointStart, const int idxPointEnd, double distance)
{
    _distances[idxPointStart*_dimension+idxPointEnd] = distance;
}

double TSPDistanceMatrix::getDistance(const int idxPointStart, const int idxPointEnd) const
{
    assert(idxPointStart*_dimension+idxPointEnd < _dimension*_dimension);
    return _distances[idxPointStart*_dimension+idxPointEnd];
}

double TSPDistanceMatrix::getTotalDistanceForRoundTrip(const std::vector<int>& indices) const
{
    double distanceTotal = 0.0;
    if(indices.size() > 1)
    {
        for(size_t i=0; i < indices.size(); i++)
        {

            if(i != indices.size() - 1)
            {
                distanceTotal += getDistance(indices[i],indices[i+1]);
            }
            else
            {
                distanceTotal += getDistance(indices[i],indices[0]);
            }
        }
    }
    return distanceTotal;
}


}
