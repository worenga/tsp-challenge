#include <memory>

#include "tsp_solver.h"
#include "tsp_io.h"
#include "tsp_run_config.h"


int main(int argc, char **argv)
{
    using namespace tsp_challenge;
    TSPRunConfig cfg;
    try
    {
         cfg = TSPReadStdin();
    }
    catch (const std::runtime_error& error)
    {
        TSPOutputError(std::string("Error Parsing Input: ") + error.what());
        exit (EXIT_FAILURE);
    }

    auto result = TSPSolve(cfg);
    TSPOutputFinalResult(result);

    exit (EXIT_SUCCESS);
}
