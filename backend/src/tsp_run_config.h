#pragma once

#include <memory>

#include "tsp_distance_matrix.h"

namespace tsp_challenge
{

class TSPRunConfig
{
    int _iterations;
    std::shared_ptr<TSPDistanceMatrix> _distanceMatrix;
    public:
        TSPRunConfig()
        {}
        TSPRunConfig(int iterations, std::shared_ptr<TSPDistanceMatrix> distanceMatrix):_iterations(iterations),_distanceMatrix(distanceMatrix)
        {}
        int getIterations() const {return _iterations;}
        std::shared_ptr<TSPDistanceMatrix> getDistanceMatrix() const {return _distanceMatrix;}
};


}
