const fs = require('fs')
const path = require('path')
const util = require('util')

const Web3 = require('web3')
const ethUtil = require('ethereumjs-util')
const contract = require('truffle-contract')

const readFile = util.promisify(fs.readFile)

const tokens = [
  {
    contract: 'AEToken.json',
    address: '0x5CA9a71B1d01849C0a95490Cc00559717fCF0D1d'
  },
  {
    contract: 'AElfToken.json',
    address: '0xbf2179859fc6D5BEE9Bf9158632Dc51678a4100e'
  },
  {
    contract: 'BNB.json',
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
  },
  {
    contract: 'HBToken.json',
    address: '0x6f259637dcD74C767781E37Bc6133cd6A68aa161'
  },
  {
    contract: 'IOSToken.json',
    address: '0xFA1a856Cfa3409CFa145Fa4e20Eb270dF3EB21ab'
  },
  {
    contract: 'IcxToken.json',
    address: '0xb5A5F22694352C15B00323844aD545ABb2B11028'
  },
  {
    contract: 'LoopringToken.json',
    address: '0xEF68e7C694F40c8202821eDF525dE3782458639f'
  },
  {
    contract: 'OMGToken.json',
    address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'
  },
  {
    contract: 'TronToken.json',
    address: '0xf230b790E05390FC8295F4d3F60332c93BEd42e2'
  },
  {
    contract: 'VEN.json',
    address: '0xD850942eF8811f2A866692A623011bDE52a462C1'
  },
  {
    contract: 'ZRXToken.json',
    address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
  },
  {
    contract: 'ZilliqaToken.json',
    address: '0x05f4a42e251f2d52b8ed15E9FEdAacFcEF1FAD27'
  },
  {
    contract: 'SNT.json',
    address: '0x744d70FDBE2Ba4CF95131626614a1763DF805B9E'
  },
  {
    contract: 'HumanStandardToken.json',
    address: '0xcB97e65F07DA24D46BcDD078EBebd7C6E6E3d750'
  }
]

const websocketProvider = process.env.WEBSOCKET_PROVIDER || 'ws://localhost:8546'
const web3 = new Web3(Web3.givenProvider || websocketProvider)

const main = async () => {
  const contracts = []
  for (let token of tokens) {
    const contractPath = path.resolve(
      __dirname,
      'build',
      'contracts',
      token.contract
    )

    const contractFile = await readFile(contractPath, 'utf-8')
    const c = contract(JSON.parse(contractFile))
    // https://github.com/trufflesuite/truffle-contract/issues/57
    c.setProvider(web3.currentProvider)
    if (typeof c.currentProvider.sendAsync != 'function') {
      c.currentProvider.sendAsync = function() {
        return c.currentProvider.send.apply(c.currentProvider, arguments)
      }
    }
    const instance = await c.at(token.address)
    contracts.push(instance)
    console.log(token.contract, 'loaded.')
  }

  for (;;) {
    let pk = ''
    for (let n = 0; n < 64; n++) {
      pk += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][
        Math.floor(Math.random() * 16)
      ]
    }

    const address = ethUtil.privateToAddress(new Buffer(pk, 'hex'))
    const hexAddress = address.toString('hex')
    try {
      const ethBalance = await web3.eth.getBalance(hexAddress)
      if (ethBalance > 0) {
        console.log(`pk: ${pk}\neth: ${ethBalance}`)
      }
      for (let i in contracts) {
        const tokenBalance = await contracts[i].balanceOf('0x' + hexAddress)
        if (tokenBalance > 0) {
          console.log(`pk: ${pk}\n${tokens[i].contract}: ${tokenBalance}`)
        }
      }
    } catch (err) {
      console.log('error:', err)
    }
  }
}

main()
