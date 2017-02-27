#pragma once

#include <memory>
#include <geneial/algorithm/SteadyStateAlgorithm.h>

#include "tsp_distance_matrix.h"


namespace tsp_challenge
{


using namespace geneial;
using namespace geneial::population::chromosome;


class TSPSolutionEvaluator: public FitnessEvaluator<double>
{

private:
    std::shared_ptr<TSPDistanceMatrix> _distanceMatrix;

public:
    TSPSolutionEvaluator(std::shared_ptr<TSPDistanceMatrix> distances):_distanceMatrix(distances)
    {
    }

    std::unique_ptr<Fitness<double>> evaluate(const BaseChromosome<double>& chromosome) const
    {
        try
        {
            const auto& mvc = dynamic_cast<const MultiValueChromosome<int, double>&>(chromosome);
            const double distance = _distanceMatrix->getTotalDistanceForRoundTrip(mvc.getContainer());
            return std::unique_ptr<Fitness<double>>(new Fitness<double>(-distance));
        }
        catch(std::bad_cast&)
        {
            throw new std::runtime_error("Chromosome is not an Integer MultiValueChromosome with double fitness!");
        }
        std::unique_ptr<Fitness<double>> ptr(new Fitness<double>);
        return ptr;
    }
};


}
