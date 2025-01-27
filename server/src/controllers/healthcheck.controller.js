import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const checkHealth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "working fine as wine")
    )
})

export { checkHealth }