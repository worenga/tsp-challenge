#include <stdexcept>
#include <cassert>
#include <memory>
#include <unordered_map>
#include <functional>


#include <geneial/algorithm/SteadyStateAlgorithm.h>
#include <geneial/algorithm/criteria/MaxGenerationCriterion.h>
#include <geneial/core/population/builder/PermutationChromosomeFactory.h>
#include <geneial/core/operations/crossover/MultiValuePermutationCrossover.h>
#include <geneial/core/operations/mutation/ValueSwapMutationOperation.h>
#include <geneial/core/population/management/Bookkeeper.h>
#include <geneial/algorithm/criteria/CombinedCriterion.h>
#include <geneial/algorithm/criteria/MaxGenerationCriterion.h>
#include <geneial/algorithm/diagnostics/Diagnostics.h>
#include <geneial/utility/mixins/Hasher.h>
#include <geneial/algorithm/observer/AlgorithmObserver.h>


#include "tsp_solver.h"
#include "tsp_solution_evaluator.hpp"

namespace tsp_challenge {

using namespace geneial;

using namespace geneial::algorithm;
using namespace geneial::utility;

using namespace geneial::algorithm::stopping_criteria;

using namespace geneial::population;
using namespace geneial::population::chromosome;
using namespace geneial::population::management;

using namespace geneial::operation::crossover;
using namespace geneial::operation::mutation;

using geneial::population::management::StatisticBookkeeper;
using geneial::algorithm::Diagnostics;



class IterationObserver: public AlgorithmObserver<double>
{
    iterationcb _cb;
    int _num_iterations;
public:
    IterationObserver(iterationcb cb, int num_interations): _cb(cb), _num_iterations(num_interations)
    {
        this->addSubscribedEvent(AlgorithmObserver<double>::AFTER_GENERATION);
    }
    virtual ~IterationObserver()
    {
    }

    virtual void updateAfterGeneration(BaseManager<double> &manager) override
    {
        auto current_iteration = manager.getPopulation().getAge();
        if((current_iteration % std::max(1,_num_iterations / 100)) == 0)
        {
            auto bestChromosome = std::dynamic_pointer_cast<MultiValueChromosome<int, double>>(manager.getHighestFitnessChromosome());
            _cb(_num_iterations,current_iteration,bestChromosome->getContainer());
        }
    }
};



std::vector<int>
TSPSolve(const TSPRunConfig & cfg,iterationcb cb)
{

    const int num_nodes = cfg.getDistanceMatrix()->getDimension();

    auto evaluator = std::make_shared<TSPSolutionEvaluator>(cfg.getDistanceMatrix());
    PermutationChromosomeFactory<int,double>::Builder factoryBuilder(evaluator);

    //How many times should new chromosomes be shuffled around?
    factoryBuilder.getSettings().setPermutationRoundsMin(num_nodes);
    factoryBuilder.getSettings().setPermutationRoundsMax(2*num_nodes);

    //How many values to permutate?
    factoryBuilder.getSettings().setNum(num_nodes);

    auto factory = std::dynamic_pointer_cast<MultiValueChromosomeFactory<int, double>>(factoryBuilder.create());

    //Crossover:
    auto permutationCrossover = MultiValuePermutationCrossover<int,double>::Builder(factory).create();

    //Mutation:
    auto permutationMutationBuilder = ValueSwapMutationOperation<int,double>::Builder(factory);
    permutationMutationBuilder.getSettings().setMinimumPointsToMutate(1);
    permutationMutationBuilder.getSettings().setMaximumPointsToMutate(1);

    //Stopping Criteria
    auto stoppingCriterion = std::make_shared<CombinedCriterion<double>>();
    stoppingCriterion->add(CombinedCriterion<double>::INIT,
        std::make_shared<MaxGenerationCriterion<double>>(cfg.getIterations()));


    auto algorithm = SteadyStateAlgorithm<double>::Builder()
    .setChromosomeFactory(factory)
    .setCrossoverOperation(permutationCrossover)
    .setMutationOperation(permutationMutationBuilder.create())
    .setStoppingCriterion(stoppingCriterion)
    .create();

	algorithm->registerObserver(std::make_shared<IterationObserver>(cb, cfg.getIterations()));


    algorithm->getPopulationSettings().setMaxChromosomes(num_nodes*2);
    algorithm->solve();

    auto bestChromosome = std::dynamic_pointer_cast<MultiValueChromosome<int, double>>(algorithm->getHighestFitnessChromosome());
    std::vector<int> result(bestChromosome->getContainer());
    return result;
}

}
