#pragma once

#include <vector>
#include <cstddef>

namespace tsp_challenge {

    class TSPDistanceMatrix
    {
        private:
            size_t _dimension;
            std::vector<double> _distances;
        public:
            TSPDistanceMatrix() = delete;
            TSPDistanceMatrix(size_t dimension): _dimension(dimension), _distances(dimension*dimension,0.0)
            {};

            size_t getDimension() const { return _dimension; }
            void registerDistance(const int idxPointStart, const int idxPointEnd, double distance);
            double getDistance(const int idxPointStart, const int idxPointEnd) const;
            double getTotalDistanceForRoundTrip(const std::vector<int>& indices) const;
    };
}
