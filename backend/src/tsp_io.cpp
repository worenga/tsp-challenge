#include "tsp_io.h"

#include <iostream>
#include <string>

#include "vendor/json.hpp"


namespace tsp_challenge
{

using json = nlohmann::json;

TSPRunConfig TSPReadStdin()
{
    std::string line;
    std::getline(std::cin, line);
    auto parsed_input = json::parse(line);

    //Validate Input, we expect a matrix in array form:
    if(parsed_input.empty())
    {
        throw std::runtime_error("Parsed input is empty!");
    }

    if(parsed_input.find("iterations") == parsed_input.end())
    {
        throw std::runtime_error("Must supply an amount of GA iterations!");
    }

    if(parsed_input.find("distanceMatrix") == parsed_input.end())
    {
        throw std::runtime_error("Must supply a distance Matrix!");
    }

    if(!parsed_input["distanceMatrix"].is_array())
    {
        throw std::runtime_error("Expecting root node to be an array!");
    }

    const size_t root_size = parsed_input["distanceMatrix"].size();

    if(root_size < 3)
    {
        throw std::runtime_error("Distance Matrix should be larger than 2!");
    }

    int rowidx = 0, colidx;
    for (auto& element : parsed_input["distanceMatrix"])
    {
      colidx = 0;
      if(!element.is_array() || element.size() != root_size)
      {
          throw std::runtime_error("Expecting an quardratic distance matrix as input!");
      }
      for (auto& inner_element : element)
      {
          if(!inner_element.is_number())
          {
              throw std::runtime_error("Expecting only numbers in distance matrix!");
          }

          if(rowidx == colidx)
          {
              if(inner_element != 0.0)
              {
                  throw std::runtime_error("Distance to self is expected to always be 0.0!");
              }
          }
          colidx++;
      }
      rowidx++;
    }

    //Finally, create the distance table:
    auto distanceMatrix = std::make_shared<TSPDistanceMatrix>(root_size);

    rowidx = 0;
    for (auto& element : parsed_input["distanceMatrix"])
    {
        colidx = 0;
        for (auto& inner_element : element)
        {
            distanceMatrix->registerDistance(rowidx,colidx,inner_element);
            colidx++;
        }
        rowidx++;
    }

    return TSPRunConfig(parsed_input["iterations"],distanceMatrix);

}

void
TSPOutputProgress(int num_iterations)
{
    json o;
    o["event"] = "PROGRESS";
    o["iterations_done"] = num_iterations;
    std::cout << o ;
}

void
TSPOutputError(const std::string& error_message)
{
    json o;
    o["event"] = "ERROR";
    o["message"] = error_message;
    std::cout << o ;
}

void
TSPOutputFinalResult(const std::vector<int>& bestPermutation)
{
    json o;
    o["event"] = "DONE";
    o["best_path"] = bestPermutation;
    std::cout << o;
}

}
